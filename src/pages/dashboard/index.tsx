import React from "react";
import { Dashboard } from "./Dashboard";
import { DashboardFeature, useDashboard } from "../../features/Dashboard";
import { match, PickState } from "react-states";
import {
  UserDashboardFeature,
  useUserDashboard,
} from "../../features/UserDashboard";
import { Navigation } from "./Navigation";
import { NavigationFeature } from "../../features/Navigation";
import { useHistory, useRouteMatch } from "react-router";
import { AuthFeature } from "../../features/Auth";

const SharedDashboard = () => {
  const [state] = useDashboard();

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

const UserDashboard = () => {
  const [state] = useUserDashboard();

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

export const DashboardPage = ({
  auth,
}: {
  auth: PickState<AuthFeature, "AUTHENTICATED">;
}) => {
  const history = useHistory();
  const match = useRouteMatch<{ userId: string }>("/:userId");

  return (
    <div className="min-h-screen p-6">
      <NavigationFeature
        auth={auth}
        navigate={(path) => {
          history.push(path);
        }}
      >
        <Navigation />
      </NavigationFeature>
      {match ? (
        <UserDashboardFeature uid={match.params.userId}>
          <UserDashboard />
        </UserDashboardFeature>
      ) : (
        <DashboardFeature>
          <SharedDashboard />
        </DashboardFeature>
      )}
    </div>
  );
};
