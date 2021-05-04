import React, { useReducer } from "react";
import {
  useEnterEffect,
  useEvents,
  createContext,
  createHook,
  createReducer,
} from "react-states";

import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { AuthenticationEvent, User } from "../../environment/authentication";

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

export type PublicAuthEvent = {
  type: "SIGN_IN";
};

export type AuthEvent = PublicAuthEvent | AuthenticationEvent;

const authContext = createContext<AuthContext, PublicAuthEvent>();

export const useAuth = createHook(authContext);

const authReducer = createReducer<AuthContext, AuthEvent>({
  CHECKING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED": ({ user }): AuthContext => ({
      state: "AUTHENTICATED",
      user,
    }),
    "AUTHENTICATION:UNAUTHENTICATED": (): AuthContext => ({
      state: "UNAUTHENTICATED",
    }),
  },
  UNAUTHENTICATED: {
    SIGN_IN: (): AuthContext => ({ state: "SIGNING_IN" }),
  },
  SIGNING_IN: {
    "AUTHENTICATION:AUTHENTICATED": ({ user }): AuthContext => ({
      state: "AUTHENTICATED",
      user,
    }),
    "AUTHENTICATION:SIGN_IN_ERROR": ({ error }): AuthContext => ({
      state: "ERROR",
      error,
    }),
  },
  AUTHENTICATED: {},
  ERROR: {},
});

export const AuthFeature = ({
  children,
  initialContext = {
    state: "CHECKING_AUTHENTICATION",
  },
}: {
  children: React.ReactNode;
  initialContext?: AuthContext;
}) => {
  const { authentication } = useEnvironment();
  const authStates = useReducer(authReducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("auth", authStates);
  }

  const [auth, send] = authStates;

  useEvents(authentication.events, send);

  useEnterEffect(auth, "SIGNING_IN", () => authentication.signIn());

  return (
    <authContext.Provider value={authStates}>{children}</authContext.Provider>
  );
};
