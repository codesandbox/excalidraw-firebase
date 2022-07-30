import React from "react";
import { Dashboard } from "./Dashboard";
import { match, usePromise } from "react-states";
import { useEnvironment } from "../../environment-interface";

export const SharedDashboard = () => {
  const { storage } = useEnvironment();
  const [state] = usePromise(() => storage.fetchPreviews());

  return match(state, {
    PENDING: () => <div className="lds-dual-ring"></div>,
    REJECTED: ({ error }) => (
      <p style={{ color: "tomato" }}>There was an error: {error}</p>
    ),
    RESOLVED: ({ value: excalidraws }) => (
      <Dashboard excalidraws={excalidraws} />
    ),
  });
};

export const UserDashboard: React.FC<{ uid: string }> = ({ uid }) => {
  const { storage } = useEnvironment();
  const [state] = usePromise(() => storage.fetchUserPreviews(uid), [uid]);

  return match(state, {
    PENDING: () => <div className="lds-dual-ring"></div>,
    REJECTED: ({ error }) => (
      <p style={{ color: "tomato" }}>There was an error: {error}</p>
    ),
    RESOLVED: ({ value: excalidraws }) => (
      <Dashboard excalidraws={excalidraws} />
    ),
  });
};
