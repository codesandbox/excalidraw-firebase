import React, { createContext, useContext, useEffect, useReducer } from "react";
import firebase from "firebase/app";
import { exec, PickState, transition } from "react-states";

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
      user: firebase.User;
    };

type Action =
  | {
      type: "SIGN_IN";
    }
  | {
      type: "SIGN_IN_SUCCESS";
      user: firebase.User;
    }
  | {
      type: "SIGN_IN_ERROR";
      error: string;
    };

function signInGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();

  return firebase.auth().signInWithPopup(provider);
}

const authContext = createContext({} as [Context, React.Dispatch<Action>]);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useReducer(
    (context: Context, action: Action) =>
      transition(context, action, {
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
      }),
    {
      state: "AUTHENTICATING",
    }
  );
  const [context, dispatch] = auth;

  useEffect(
    () =>
      exec(context, {
        SIGNING_IN: () => {
          signInGoogle()
            .then((result) => {
              const user = result.user;

              if (user) {
              } else {
                dispatch({
                  type: "SIGN_IN_ERROR",
                  error: "Authenticated, but no user",
                });
              }
            })
            .catch((error) => {
              dispatch({
                type: "SIGN_IN_ERROR",
                error: error.message,
              });
            });
        },
        AUTHENTICATING: () => {
          firebase.auth().onAuthStateChanged((user) => {
            if (user) {
              dispatch({ type: "SIGN_IN_SUCCESS", user });
            } else {
              dispatch({ type: "SIGN_IN_ERROR", error: "Not authenticated" });
            }
          });
        },
      }),
    [context]
  );

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

export const useAuth = () => useContext(authContext);

export const useAuthenticatedAuth = () => {
  const [context, dispatch] = useAuth();

  if (context.state === "AUTHENTICATED") {
    return [context, dispatch] as const;
  }

  throw new Error(
    "You are not using the Auth provider in an Authenticated component"
  );
};
