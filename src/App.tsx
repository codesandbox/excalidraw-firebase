import React, { useEffect, useReducer } from "react";
import firebase from "firebase/app";
import { exec, transform, transition } from "react-states";
import { Router } from "./Router";

type Context =
  | {
      state: "UNAUTHENTICATED";
      error?: string;
    }
  | {
      state: "AUTHENTICATING";
    }
  | {
      state: "AUTHENTICATED";
    };

type Action =
  | {
      type: "AUTHENTICATE";
    }
  | {
      type: "AUTHENTICATE_SUCCESS";
      user: firebase.User;
    }
  | {
      type: "AUTHENTICATE_ERROR";
      error: string;
    };

function signInGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();

  return firebase.auth().signInWithPopup(provider);
}

function Auth() {
  const [context, dispatch] = useReducer(
    (context: Context, action: Action) =>
      transition(context, action, {
        UNAUTHENTICATED: {
          AUTHENTICATE: () => ({ state: "AUTHENTICATING" }),
        },
        AUTHENTICATING: {
          AUTHENTICATE_SUCCESS: ({ user }) => ({
            state: "AUTHENTICATED",
            user,
          }),
          AUTHENTICATE_ERROR: ({ error }) => ({
            state: "UNAUTHENTICATED",
            error,
          }),
        },
        AUTHENTICATED: {},
      }),
    {
      state: "UNAUTHENTICATED",
    }
  );

  useEffect(
    () =>
      exec(context, {
        AUTHENTICATING: () => {
          signInGoogle()
            .then((result) => {
              const user = result.user;

              if (user) {
                dispatch({ type: "AUTHENTICATE_SUCCESS", user });
              } else {
                dispatch({
                  type: "AUTHENTICATE_ERROR",
                  error: "Authenticated, but no user",
                });
              }
            })
            .catch((error) => {
              dispatch({
                type: "AUTHENTICATE_ERROR",
                error: error.message,
              });
            });
        },
      }),
    [context]
  );

  return (
    <div className="App">
      {transform(context, {
        UNAUTHENTICATED: () => (
          <button onClick={() => dispatch({ type: "AUTHENTICATE" })}>
            Sign In
          </button>
        ),
        AUTHENTICATING: () => "Authenticating...",
        AUTHENTICATED: () => <Router />,
      })}
    </div>
  );
}

export default Auth;
