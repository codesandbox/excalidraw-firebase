import React from "react";
import { transform } from "react-states";
import { Router } from "./Router";
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
        AUTHENTICATED: () => <Router />,
      })}
    </div>
  );
};
