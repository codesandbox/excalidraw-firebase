import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { match } from "react-states";
import { useAuth } from "../features/Auth";
import { DashboardPage } from "./dashboard";
import { ExcalidrawPage } from "./excalidraw";

export const Pages = () => {
  const [auth, send] = useAuth();

  return (
    <div className="bg-gray-100">
      {match(auth, {
        UNAUTHENTICATED: () => (
          <div className="h-screen flex items-center justify-center">
            <button
            className="order-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:order-1 sm:ml-3"
            onClick={() => send({ type: "SIGN_IN" })}>Sign In</button>
          </div>
        ),
        CHECKING_AUTHENTICATION: () => (
          <div className="h-screen flex items-center justify-center">
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
          <div className="h-screen flex items-center justify-center">
            <div className="lds-dual-ring"></div>
          </div>
        ),
        ERROR: ({ error }) => (
          <div className="h-screen flex items-center justify-center">
            <h4>Uh oh, something bad happened</h4>
            {error}
          </div>
        ),
      })}
    </div>
  );
};
