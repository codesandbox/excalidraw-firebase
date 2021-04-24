import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { match } from "react-states";
import { useAuth } from "../features/Auth";
import { DashboardPage } from "./dashboard";
import { ExcalidrawPage } from "./excalidraw";

export const Pages = () => {
  const [auth, send] = useAuth();

  return (
    <div className="App">
      {match(auth, {
        UNAUTHENTICATED: () => (
          <div className="center-wrapper">
            <button onClick={() => send({ type: "SIGN_IN" })}>Sign In</button>
          </div>
        ),
        CHECKING_AUTHENTICATION: () => (
          <div className="center-wrapper">
            <div className="lds-dual-ring"></div>
          </div>
        ),
        AUTHENTICATED: () => (
          <Router>
            <Switch>
              <Route exact path="/">
                <DashboardPage />
              </Route>
              <Route path="/:userId/:id">
                <ExcalidrawPage />
              </Route>
            </Switch>
          </Router>
        ),
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
