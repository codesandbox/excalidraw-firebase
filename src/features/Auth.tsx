import React, { createContext, useContext, useEffect } from "react";
import { States, useStates } from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../environment";
import { User } from "../environment/auth";

export type AuthContext =
  | {
      state: "AUTHENTICATING";
    }
  | {
      state: "UNAUTHENTICATED";
      error?: string;
    }
  | {
      state: "SIGNING_IN";
    }
  | {
      state: "AUTHENTICATED";
      user: User;
    };

const SIGN_IN_SUCCESS = Symbol("SIGN_IN_SUCCESS");
const SIGN_IN_ERROR = Symbol("SIGN_IN_ERROR");

export type AuthAction =
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

export type AuthFeature = States<AuthContext, AuthAction>;

const context = createContext({} as AuthFeature);

export const useAuth = () => useContext(context);

export const useAuthenticatedAuth = () => {
  const auth = useAuth();

  if (auth.is("AUTHENTICATED")) {
    return auth;
  }

  throw new Error(
    "You are not using the Auth provider in an Authenticated component"
  );
};

export const AuthFeature = ({
  children,
  initialContext = {
    state: "AUTHENTICATING",
  },
}: {
  children: React.ReactNode;
  initialContext?: AuthContext;
}) => {
  const environment = useEnvironment();
  const auth = useStates<AuthContext, AuthAction>(
    {
      AUTHENTICATING: {
        [SIGN_IN_SUCCESS]: ({ user }) => ({
          state: "AUTHENTICATED",
          user,
        }),
        [SIGN_IN_ERROR]: ({ error }) => ({
          state: "UNAUTHENTICATED",
          error,
        }),
      },
      UNAUTHENTICATED: {
        SIGN_IN: () => ({ state: "SIGNING_IN" }),
      },
      SIGNING_IN: {
        [SIGN_IN_SUCCESS]: ({ user }) => ({
          state: "AUTHENTICATED",
          user,
        }),
        [SIGN_IN_ERROR]: ({ error }) => ({
          state: "UNAUTHENTICATED",
          error,
        }),
      },
      AUTHENTICATED: {},
    },
    initialContext
  );

  if (process.env.NODE_ENV === "development") {
    useDevtools("auth", auth as any);
  }

  useEffect(
    () =>
      auth.exec({
        SIGNING_IN: () =>
          environment.auth.signIn().resolve(
            (user) => {
              auth.dispatch({ type: SIGN_IN_SUCCESS, user });
            },
            {
              NOT_SIGNED_IN: () => {
                auth.dispatch({
                  type: SIGN_IN_ERROR,
                  error: "Authenticated, but no user",
                });
              },
              ERROR: (error) => {
                auth.dispatch({
                  type: SIGN_IN_ERROR,
                  error: error.message,
                });
              },
            }
          ),
        AUTHENTICATING: () =>
          environment.auth.onAuthChange((user) => {
            if (user) {
              auth.dispatch({ type: SIGN_IN_SUCCESS, user });
            } else {
              auth.dispatch({
                type: SIGN_IN_ERROR,
                error: "Not authenticated",
              });
            }
          }),
      }),
    [auth]
  );

  return <context.Provider value={auth}>{children}</context.Provider>;
};
