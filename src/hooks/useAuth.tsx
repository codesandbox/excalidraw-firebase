import { Dispatch, useEffect, useReducer } from "react";
import { transition, useStateTransition } from "react-states";
import { useDevtools } from "react-states/devtools";
import { registerHook } from ".";
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

const reducer = (
  prevState: AuthState,
  action: AuthAction | AuthenticationEvent
) =>
  transition(prevState, action, {
    CHECKING_AUTHENTICATION: {
      "AUTHENTICATION:AUTHENTICATED": (_, { user, loomApiKey }) => ({
        state: "AUTHENTICATED",
        user,
        loomApiKey,
      }),
      "AUTHENTICATION:UNAUTHENTICATED": () => ({
        state: "UNAUTHENTICATED",
      }),
    },
    UNAUTHENTICATED: {
      SIGN_IN: () => ({ state: "SIGNING_IN" }),
    },
    SIGNING_IN: {
      "AUTHENTICATION:AUTHENTICATED": (_, { user, loomApiKey }) => ({
        state: "AUTHENTICATED",
        user,
        loomApiKey,
      }),
      "AUTHENTICATION:SIGN_IN_ERROR": (_, { error }) => ({
        state: "ERROR",
        error,
      }),
    },
    AUTHENTICATED: {},
    ERROR: {},
  });

export const useAuth = registerHook(
  ({ authState }): [AuthState, Dispatch<AuthAction>] => {
    const { authentication } = useEnvironment();
    const auth = useReducer(
      reducer,
      authState || {
        state: "CHECKING_AUTHENTICATION",
      }
    );

    useDevtools("auth", auth);

    const [state, dispatch] = auth;

    useEffect(() => authentication.subscribe(dispatch), []);

    useStateTransition(state, "SIGNING_IN", () => authentication.signIn());

    return auth;
  }
);

export const useAuthenticatedAuth = registerHook(useAuth, ([state]) => {
  if (state.state === "AUTHENTICATED") {
    return state;
  }

  throw new Error("You are using authenticated state in an invalid cont");
});
