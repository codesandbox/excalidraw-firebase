import React, { createContext, useContext, useEffect, useReducer } from "react";
import { exec, matches, StatesReducer, transitions } from "react-states";
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

export type AuthReducer = StatesReducer<AuthContext, AuthAction>;

const context = createContext({} as AuthReducer);

export const useAuth = () => useContext(context);

export const useAuthenticatedAuth = () => {
  const auth = useAuth();

  if (matches(auth, "AUTHENTICATED")) {
    return auth;
  }

  throw new Error("Invalid use of Auth");
};

const reducer = transitions<AuthContext, AuthAction>({
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
  const authReducer = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("auth", authReducer);
  }

  const [auth, dispatch] = authReducer;

  useEffect(
    () =>
      exec(auth, {
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
    [auth]
  );

  return <context.Provider value={authReducer}>{children}</context.Provider>;
};
