import React from "react";
import { Dashboard } from "./Dashboard";
import { DashboardFeature } from "../../features/Dashboard";

export const DashboardPage = () => (
  <DashboardFeature>
    <Dashboard />
  </DashboardFeature>
);
