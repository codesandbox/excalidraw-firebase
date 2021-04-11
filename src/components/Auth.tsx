import React from "react";
import { Pages } from "../pages";
import { useAuth } from "../features/Auth";
import { match } from "react-states";

export const Auth = () => {
  const [auth, dispatch] = useAuth();

  return (
    <div className="App">
      {match(auth, {
        UNAUTHENTICATED: () => (
          <div className="center-wrapper">
            <button onClick={() => dispatch({ type: "SIGN_IN" })}>
              Sign In
            </button>
          </div>
        ),
        CHECKING_AUTHENTICATION: () => (
          <div className="center-wrapper">
            <div className="lds-dual-ring"></div>
          </div>
        ),
        AUTHENTICATED: () => <Pages />,
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
