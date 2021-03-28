import React from "react";
import { Dashboard } from "./Dashboard";
import { DashboardProvider } from "../features/Dashboard";
import { Excalidraw } from "./Excalidraw";
import { ExcalidrawProvider } from "../features/Excalidraw";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
} from "react-router-dom";

const DashboardPage = () => (
  <DashboardProvider>
    <Dashboard />
  </DashboardProvider>
);

const ExcalidrawPage = () => {
  let { id, userId } = useParams<{ id: string; userId: string }>();

  return (
    <ExcalidrawProvider key={id} id={id} userId={userId}>
      <Excalidraw />
    </ExcalidrawProvider>
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
