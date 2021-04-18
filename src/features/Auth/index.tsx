import React, { createContext, useEffect, useReducer } from "react";
import { exec, transitions } from "react-states";
import { createUseTransitionsReducer, TransitionsReducer } from "react-states";
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

const reducerContext = createContext(
  {} as TransitionsReducer<AuthContext, AuthAction>
);

export const useAuth = createUseTransitionsReducer(reducerContext);

const reducer = transitions<AuthContext, AuthAction>({
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
  const environment = useEnvironment();
  const auth = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("auth", auth);
  }

  const [context, dispatch] = auth;

  useEffect(
    () =>
      exec(context, {
        SIGNING_IN: () =>
          environment.auth.signIn().resolve(
            (user) => {
              dispatch({ type: SIGN_IN_SUCCESS, user });
            },
            {
              NOT_SIGNED_IN: () => {
                dispatch({
                  type: SIGN_IN_ERROR,
                  error: "Authenticated, but no user",
                });
              },
              ERROR: (error) => {
                dispatch({
                  type: SIGN_IN_ERROR,
                  error: error.message,
                });
              },
            }
          ),
        CHECKING_AUTHENTICATION: () =>
          environment.auth.onAuthChange((user) => {
            if (user) {
              dispatch({ type: SIGN_IN_SUCCESS, user });
            } else {
              dispatch({
                type: SIGN_IN_ERROR,
                error: "Not authenticated",
              });
            }
          }),
      }),
    [context]
  );

  return (
    <reducerContext.Provider value={auth}>{children}</reducerContext.Provider>
  );
};
