import React from "react";
import { Dashboard } from "./Dashboard";
import { match, PickState } from "react-states";

import { Navigation } from "./Navigation";
import { useMatch } from "react-router-dom";

import { useDashboard } from "./useDashboard";
import { useUserDashboard } from "./useUserDashboard";

const SharedDashboard = () => {
  const state = useDashboard();

  return match(state, {
    LOADING_PREVIEWS: () => <div className="lds-dual-ring"></div>,
    PREVIEWS_ERROR: ({ error }) => (
      <p style={{ color: "tomato" }}>There was an error: {error}</p>
    ),
    PREVIEWS_LOADED: ({ excalidraws }) => (
      <Dashboard excalidraws={excalidraws} />
    ),
  });
};

const UserDashboard: React.FC<{ uid: string }> = ({ uid }) => {
  const [state] = useUserDashboard({ uid });

  return match(state, {
    LOADING_PREVIEWS: () => <div className="lds-dual-ring"></div>,
    PREVIEWS_ERROR: ({ error }) => (
      <p style={{ color: "tomato" }}>There was an error: {error}</p>
    ),
    PREVIEWS_LOADED: ({ excalidraws }) => (
      <Dashboard excalidraws={excalidraws} />
    ),
  });
};

export const DashboardPage = () => {
  const match = useMatch("/:userId");

  return (
    <div className="min-h-screen p-6">
      <Navigation />
      {match?.params.userId ? (
        <UserDashboard uid={match.params.userId} />
      ) : (
        <SharedDashboard />
      )}
    </div>
  );
};
