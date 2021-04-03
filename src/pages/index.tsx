import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { DashboardPage } from "./DashboardPage";
import { ExcalidrawPage } from "./ExcalidrawPage";

export const Pages = () => {
  return (
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
  );
};
