import React from "react";
import { Navigation } from "./Navigation";
import { useAuth } from "../features/AuthProvider";

export const Auth = () => {
  const auth = useAuth();

  return (
    <div className="App">
      {auth.map({
        UNAUTHENTICATED: () => (
          <div className="center-wrapper">
            <button onClick={() => auth.dispatch({ type: "SIGN_IN" })}>
              Sign In
            </button>
          </div>
        ),
        AUTHENTICATING: () => (
          <div className="center-wrapper">
            <h1>...authenticating...</h1>
          </div>
        ),
        AUTHENTICATED: () => <Navigation />,
        SIGNING_IN: () => (
          <div className="center-wrapper">
            <h1>...signing in...</h1>
          </div>
        ),
      })}
    </div>
  );
};
