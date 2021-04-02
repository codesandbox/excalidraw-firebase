import React from "react";
import { Navigation } from "./Navigation";
import { useAuth } from "../features/Auth";

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
        CHECKING_AUTHENTICATION: () => (
          <div className="center-wrapper">
            <div className="lds-dual-ring"></div>
          </div>
        ),
        AUTHENTICATED: () => <Navigation />,
        SIGNING_IN: () => (
          <div className="center-wrapper">
            <div className="lds-dual-ring"></div>
          </div>
        ),
        ERROR: ({ error }) => (
          <div className="center-wrapper">
            <h4>Uh oh, something bad happened</h4>
            {error}
          </div>
        ),
      })}
    </div>
  );
};
