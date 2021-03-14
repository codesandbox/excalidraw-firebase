import React from "react";
import { Dashboard } from "./Dashboard";
import { DashboardProvider } from "../features/Dashboard";
import { Excalidraw } from "./Excalidraw";
import { ExcalidrawProvider } from "../features/Excalidraw";
import { useNavigation } from "../features/Navigation";

export const Navigation = () => {
  const navigation = useNavigation();

  return navigation.map({
    INITIALIZING: () => null,
    DASHBOARD: () => (
      <DashboardProvider>
        <Dashboard />
      </DashboardProvider>
    ),
    EXCALIDRAW: ({ id, userId }) => (
      <ExcalidrawProvider id={id} userId={userId}>
        <Excalidraw />
      </ExcalidrawProvider>
    ),
  });
};
