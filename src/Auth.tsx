import React, { useEffect, useReducer, useState } from "react";
import config from "./firebase.config.json";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "./App.css";
import { exec, transform, transition } from "react-states";
import { Router } from "./Router";

firebase.initializeApp(config);

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
      type: "AUTHENTICATE";
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

export const Auth = () => {
  const [context, dispatch] = useReducer(
    (context: Context, action: Action) =>
      transition(context, action, {
        AUTHENTICATING: {
          SIGN_IN_SUCCESS: ({ user }) => ({
            state: "AUTHENTICATED",
            user,
          }),
        },
        UNAUTHENTICATED: {
          AUTHENTICATE: () => ({ state: "AUTHENTICATING" }),
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

  useEffect(
    () =>
      exec(context, {
        SIGNING_IN: () => {
          signInGoogle()
            .then((result) => {
              const user = result.user;

              if (user) {
                dispatch({ type: "SIGN_IN_SUCCESS", user });
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
            }
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
};
