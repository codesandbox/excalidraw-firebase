import React, { createContext, useContext, useEffect } from "react";
import { States, useStates } from "react-states";
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

export type AuthStates = States<AuthContext, AuthAction>;

const context = createContext({} as AuthStates);

export const useAuth = () => useContext(context);

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
  const auth = useStates<AuthContext, AuthAction>(
    {
      CHECKING_AUTHENTICATION: {
        [SIGN_IN_SUCCESS]: ({ user }) => ({
          state: "AUTHENTICATED",
          user,
        }),
        [SIGN_IN_ERROR]: () => ({
          state: "UNAUTHENTICATED",
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
          state: "ERROR",
          error,
        }),
      },
      AUTHENTICATED: {},
      ERROR: {},
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
        CHECKING_AUTHENTICATION: () =>
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
