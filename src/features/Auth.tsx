import React, { createContext, useContext, useEffect } from "react";
import { States, useStates } from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../environment";
import { User } from "../types";

type Context =
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

type Action =
  | {
      type: "SIGN_IN";
    }
  | {
      type: "SIGN_IN_SUCCESS";
      user: User;
    }
  | {
      type: "SIGN_IN_ERROR";
      error: string;
    };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const environment = useEnvironment();
  const auth = useStates<Context, Action>(
    {
      AUTHENTICATING: {
        SIGN_IN_SUCCESS: ({ user }) => ({
          state: "AUTHENTICATED",
          user,
        }),
        SIGN_IN_ERROR: ({ error }) => ({
          state: "UNAUTHENTICATED",
          error,
        }),
      },
      UNAUTHENTICATED: {
        SIGN_IN: () => ({ state: "SIGNING_IN" }),
      },
      SIGNING_IN: {
        SIGN_IN_SUCCESS: ({ user }) => ({
          state: "AUTHENTICATED",
          user,
        }),
        SIGN_IN_ERROR: ({ error }) => ({
          state: "UNAUTHENTICATED",
          error,
        }),
      },
      AUTHENTICATED: {},
    },
    {
      state: "AUTHENTICATING",
    }
  );

  if (process.env.NODE_ENV === "development") {
    useDevtools("auth", auth as any);
  }

  useEffect(
    () =>
      auth.exec({
        SIGNING_IN: () => {
          environment.auth
            .signIn()
            .then((user) => {
              if (!user) {
                auth.dispatch({
                  type: "SIGN_IN_ERROR",
                  error: "Authenticated, but no user",
                });
              }
            })
            .catch((error) => {
              auth.dispatch({
                type: "SIGN_IN_ERROR",
                error: error.message,
              });
            });
        },
        AUTHENTICATING: () => {
          environment.auth.onAuthChange((user) => {
            if (user) {
              auth.dispatch({ type: "SIGN_IN_SUCCESS", user });
            } else {
              auth.dispatch({
                type: "SIGN_IN_ERROR",
                error: "Not authenticated",
              });
            }
          });
        },
      }),
    [auth]
  );

  return <context.Provider value={auth}>{children}</context.Provider>;
};

const context = createContext({} as States<Context, Action>);

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
