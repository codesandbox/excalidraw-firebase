import React from "react";
import { Dashboard } from "../components/Dashboard";
import { DashboardFeature } from "../features/Dashboard";

export const DashboardPage = () => (
  <DashboardFeature>
    <Dashboard />
  </DashboardFeature>
);
