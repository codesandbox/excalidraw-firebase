import React, {
  createContext,
  Dispatch,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { PickState, transition, useStateEffect } from "react-states";

import { useDevtools } from "react-states";
import { useEnvironment } from "../environment-interface";
import {
  AuthenticationEvent,
  User,
} from "../environment-interface/authentication";

export type AuthState =
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
      loomApiKey: string | null;
    }
  | {
      state: "ERROR";
      error: string;
    };

export type AuthAction = {
  type: "SIGN_IN";
};

const reducer = (state: AuthState, action: AuthAction | AuthenticationEvent) =>
  transition(state, action, {
    CHECKING_AUTHENTICATION: {
      "AUTHENTICATION:AUTHENTICATED": (_, { user, loomApiKey }): AuthState => ({
        state: "AUTHENTICATED",
        user,
        loomApiKey,
      }),
      "AUTHENTICATION:UNAUTHENTICATED": (): AuthState => ({
        state: "UNAUTHENTICATED",
      }),
    },
    UNAUTHENTICATED: {
      SIGN_IN: (): AuthState => ({ state: "SIGNING_IN" }),
    },
    SIGNING_IN: {
      "AUTHENTICATION:AUTHENTICATED": (_, { user, loomApiKey }): AuthState => ({
        state: "AUTHENTICATED",
        user,
        loomApiKey,
      }),
      "AUTHENTICATION:SIGN_IN_ERROR": (_, { error }): AuthState => ({
        state: "ERROR",
        error,
      }),
    },
    AUTHENTICATED: {},
    ERROR: {},
  });

const authenticatedAuthContext = createContext(
  null as unknown as PickState<AuthState, "AUTHENTICATED">
);

export const AuthenticatedAuthProvider: React.FC<{
  auth: PickState<AuthState, "AUTHENTICATED">;
}> = ({ auth, children }) => (
  <authenticatedAuthContext.Provider value={auth}>
    {children}
  </authenticatedAuthContext.Provider>
);

export const useAuthenticatedAuth = () => useContext(authenticatedAuthContext);

export const useAuth = (
  initialState: AuthState = {
    state: "CHECKING_AUTHENTICATION",
  }
): [AuthState, Dispatch<AuthAction>] => {
  const { authentication } = useEnvironment();
  const auth = useReducer(reducer, initialState);

  useDevtools("auth", auth);

  const [state, dispatch] = auth;

  useEffect(() => authentication.subscribe(dispatch), []);

  useStateEffect(state, "SIGNING_IN", () => authentication.signIn());

  return auth;
};
