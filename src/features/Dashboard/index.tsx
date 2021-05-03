import React, { useReducer } from "react";
import {
  createContext,
  createHook,
  createReducer,
  useEnterEffect,
  useEvents,
} from "react-states";
import { ExcalidrawsByUser, StorageEvent } from "../../environment/storage";
import { useEnvironment } from "../../environment";
import { useDevtools } from "react-states/devtools";
import { useHistory } from "react-router";
import { useAuth } from "../Auth";

export type DashboardContext =
  | {
      state: "LOADING_PREVIEWS";
    }
  | {
      state: "PREVIEWS_LOADED";
      excalidraws: ExcalidrawsByUser;
      showCount: number;
    }
  | {
      state: "CREATING_EXCALIDRAW";
      excalidraws: ExcalidrawsByUser;
      showCount: number;
    }
  | {
      state: "EXCALIDRAW_CREATED";
      id: string;
    }
  | {
      state: "PREVIEWS_ERROR";
      error: string;
    }
  | {
      state: "CREATE_EXCALIDRAW_ERROR";
      excalidraws: ExcalidrawsByUser;
      showCount: number;
      error: string;
    };

export type PublicDashboardEvent = {
  type: "CREATE_EXCALIDRAW";
};

export type DashboardEvent = PublicDashboardEvent | StorageEvent;

const dashboardReducer = createReducer<DashboardContext, DashboardEvent>({
  LOADING_PREVIEWS: {
    "STORAGE:FETCH_PREVIEWS_SUCCESS": ({
      excalidrawsByUser,
    }): DashboardContext => ({
      state: "PREVIEWS_LOADED",
      excalidraws: excalidrawsByUser,
      showCount: 10,
    }),
    "STORAGE:FETCH_PREVIEWS_ERROR": ({ error }): DashboardContext => ({
      state: "PREVIEWS_ERROR",
      error,
    }),
  },
  PREVIEWS_LOADED: {
    CREATE_EXCALIDRAW: (_, { excalidraws, showCount }): DashboardContext => ({
      state: "CREATING_EXCALIDRAW",
      excalidraws,
      showCount,
    }),
  },
  CREATING_EXCALIDRAW: {
    "STORAGE:CREATE_EXCALIDRAW_SUCCESS": ({ id }): DashboardContext => ({
      state: "EXCALIDRAW_CREATED",
      id,
    }),
    "STORAGE:CREATE_EXCALIDRAW_ERROR": (
      { error },
      { excalidraws, showCount }
    ): DashboardContext => ({
      state: "CREATE_EXCALIDRAW_ERROR",
      error,
      excalidraws,
      showCount,
    }),
  },
  PREVIEWS_ERROR: {
    CREATE_EXCALIDRAW: (): DashboardContext => ({
      state: "CREATING_EXCALIDRAW",
      excalidraws: {},
      showCount: 0,
    }),
  },
  CREATE_EXCALIDRAW_ERROR: {
    CREATE_EXCALIDRAW: (_, { excalidraws, showCount }): DashboardContext => ({
      state: "CREATING_EXCALIDRAW",
      excalidraws,
      showCount,
    }),
  },
  EXCALIDRAW_CREATED: {},
});

const dashboardContext = createContext<DashboardContext, DashboardEvent>();

export const useDashboard = createHook(dashboardContext);

export const DashboardFeature = ({
  children,
  initialContext = {
    state: "LOADING_PREVIEWS",
  },
}: {
  children: React.ReactNode;
  initialContext?: DashboardContext;
}) => {
  const history = useHistory();
  const [auth] = useAuth("AUTHENTICATED");
  const { storage } = useEnvironment();
  const dashboardStates = useReducer(dashboardReducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("dashboard", dashboardStates);
  }

  const [dashboard, send] = dashboardStates;

  useEvents(storage.events, send);

  useEnterEffect(dashboard, "LOADING_PREVIEWS", () => storage.fetchPreviews());

  useEnterEffect(dashboard, "CREATING_EXCALIDRAW", () =>
    storage.createExcalidraw(auth.user.uid)
  );

  useEnterEffect(dashboard, "EXCALIDRAW_CREATED", ({ id }) => {
    history.push(`/${auth.user.uid}/${id}`);
  });

  return (
    <dashboardContext.Provider value={dashboardStates}>
      {children}
    </dashboardContext.Provider>
  );
};
