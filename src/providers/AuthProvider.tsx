import React, { createContext, useContext, useEffect } from "react";
import firebase from "firebase/app";
import { States, useStates } from "react-states";

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

const authContext = createContext({} as States<Context, Action>);

export const useAuth = () => useContext(authContext);

export const useAuthenticatedAuth = () => {
  const auth = useAuth();

  if (auth.is("AUTHENTICATED")) {
    return auth;
  }

  throw new Error(
    "You are not using the Auth provider in an Authenticated component"
  );
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
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

  useEffect(
    () =>
      auth.exec({
        SIGNING_IN: () => {
          signInGoogle()
            .then((result) => {
              const user = result.user;

              if (user) {
              } else {
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
          firebase.auth().onAuthStateChanged((user) => {
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

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

function signInGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();

  return firebase.auth().signInWithPopup(provider);
}
