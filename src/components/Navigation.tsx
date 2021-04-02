import React from "react";
import { Dashboard } from "./Dashboard";
import { DashboardFeature } from "../features/Dashboard";
import { Excalidraw } from "./Excalidraw";
import { ExcalidrawFeature } from "../features/Excalidraw";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
} from "react-router-dom";

const DashboardPage = () => (
  <DashboardFeature>
    <Dashboard />
  </DashboardFeature>
);

const ExcalidrawPage = () => {
  let { id, userId } = useParams<{ id: string; userId: string }>();

  return (
    <ExcalidrawFeature key={id} id={id} userId={userId}>
      <Excalidraw />
    </ExcalidrawFeature>
  );
};

export const Navigation = () => {
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
