import React, { useReducer } from "react";
import { createContext, createHook, createReducer } from "react-states";
import { useEnterEffect } from "react-states/cjs";

import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { User } from "../../environment/auth";

export type AuthContext =
  | {
      state: "CHECKING_AUTHENTICATION";
    }
  | {
      state: "UNAUTHENTICATED";
    }
  | {
      state: "SIGNING_IN";
    }
  | {
      state: "AUTHENTICATED";
      user: User;
    }
  | {
      state: "ERROR";
      error: string;
    };

const SIGN_IN_SUCCESS = Symbol("SIGN_IN_SUCCESS");
const SIGN_IN_ERROR = Symbol("SIGN_IN_ERROR");

export type AuthEvent =
  | {
      type: "SIGN_IN";
    }
  | {
      type: typeof SIGN_IN_SUCCESS;
      user: User;
    }
  | {
      type: typeof SIGN_IN_ERROR;
      error: string;
    };

const authReducer = createReducer<AuthContext, AuthEvent>({
  CHECKING_AUTHENTICATION: {
    [SIGN_IN_SUCCESS]: ({ user }): AuthContext => ({
      state: "AUTHENTICATED",
      user,
    }),
    [SIGN_IN_ERROR]: (): AuthContext => ({
      state: "UNAUTHENTICATED",
    }),
  },
  UNAUTHENTICATED: {
    SIGN_IN: (): AuthContext => ({ state: "SIGNING_IN" }),
  },
  SIGNING_IN: {
    [SIGN_IN_SUCCESS]: ({ user }): AuthContext => ({
      state: "AUTHENTICATED",
      user,
    }),
    [SIGN_IN_ERROR]: ({ error }): AuthContext => ({
      state: "ERROR",
      error,
    }),
  },
  AUTHENTICATED: {},
  ERROR: {},
});

const authContext = createContext<AuthContext, AuthEvent>();

export const useAuth = createHook(authContext);

export const AuthFeature = ({
  children,
  initialContext = {
    state: "CHECKING_AUTHENTICATION",
  },
}: {
  children: React.ReactNode;
  initialContext?: AuthContext;
}) => {
  const environment = useEnvironment();
  const authStates = useReducer(authReducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("auth", authStates);
  }

  const [auth, send] = authStates;

  useEnterEffect(auth, "SIGNING_IN", () =>
    environment.auth.signIn().resolve(
      (user) => {
        send({ type: SIGN_IN_SUCCESS, user });
      },
      {
        NOT_SIGNED_IN: () => {
          send({
            type: SIGN_IN_ERROR,
            error: "Authenticated, but no user",
          });
        },
        ERROR: (error) => {
          send({
            type: SIGN_IN_ERROR,
            error: error.message,
          });
        },
      }
    )
  );

  useEnterEffect(auth, "CHECKING_AUTHENTICATION", () =>
    environment.auth.onAuthChange((user) => {
      if (user) {
        send({ type: SIGN_IN_SUCCESS, user });
      } else {
        send({
          type: SIGN_IN_ERROR,
          error: "Not authenticated",
        });
      }
    })
  );

  return (
    <authContext.Provider value={authStates}>{children}</authContext.Provider>
  );
};
