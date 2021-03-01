import React from "react";
import "./App.css";
import { transform } from "react-states";
import { Router } from "./Router";
import { useAuth } from "./AuthProvider";

export const Auth = () => {
  const [context, dispatch] = useAuth();

  return (
    <div className="App">
      {transform(context, {
        UNAUTHENTICATED: () => (
          <button onClick={() => dispatch({ type: "SIGN_IN" })}>Sign In</button>
        ),
        AUTHENTICATING: () => "Authenticating...",
        AUTHENTICATED: () => <Router />,
      })}
    </div>
  );
};
