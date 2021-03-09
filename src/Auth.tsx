import React from "react";
import { Navigation } from "./Navigation";
import { useAuth } from "./AuthProvider";

export const Auth = () => {
  const auth = useAuth();

  return (
    <div className="App">
      {auth.transform({
        UNAUTHENTICATED: () => (
          <div className="center-wrapper">
            <button onClick={() => auth.dispatch({ type: "SIGN_IN" })}>
              Sign In
            </button>
          </div>
        ),
        AUTHENTICATING: () => (
          <div className="center-wrapper">Authenticating...</div>
        ),
        AUTHENTICATED: () => <Navigation />,
        SIGNING_IN: () => (
          <div className="center-wrapper">Authenticating...</div>
        ),
      })}
    </div>
  );
};
