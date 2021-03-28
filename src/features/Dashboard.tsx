import React, { useEffect } from "react";
import { States, useStates } from "react-states";
import { useAuthenticatedAuth } from "./Auth";
import { ExcalidrawsByUser } from "../environment/storage";
import { useEnvironment } from "../environment";
import { useDevtools } from "react-states/devtools";
import { useHistory } from "react-router";

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

export type DashboardAction =
  | {
      type: "CREATE_EXCALIDRAW";
    }
  | {
      type: "CREATE_EXCALIDRAW_SUCCESS";
      id: string;
    }
  | {
      type: "CREATE_EXCALIDRAW_ERROR";
      error: string;
    }
  | {
      type: "LOADING_PREVIEWS_SUCCESS";
      excalidraws: ExcalidrawsByUser;
    }
  | {
      type: "LOADING_PREVIEWS_ERROR";
      error: string;
    };

export const DashboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const history = useHistory();
  const auth = useAuthenticatedAuth();
  const { storage } = useEnvironment();
  const dashboard = useStates<DashboardContext, DashboardAction>(
    {
      LOADING_PREVIEWS: {
        LOADING_PREVIEWS_SUCCESS: ({ excalidraws }) => ({
          state: "PREVIEWS_LOADED",
          excalidraws,
          showCount: 10,
        }),
        LOADING_PREVIEWS_ERROR: ({ error }) => ({
          state: "PREVIEWS_ERROR",
          error,
        }),
      },
      PREVIEWS_LOADED: {
        CREATE_EXCALIDRAW: (_, { excalidraws, showCount }) => ({
          state: "CREATING_EXCALIDRAW",
          excalidraws,
          showCount,
        }),
      },
      CREATING_EXCALIDRAW: {
        CREATE_EXCALIDRAW_SUCCESS: ({ id }) => ({
          state: "EXCALIDRAW_CREATED",
          id,
        }),
        CREATE_EXCALIDRAW_ERROR: ({ error }, { excalidraws, showCount }) => ({
          state: "CREATE_EXCALIDRAW_ERROR",
          error,
          excalidraws,
          showCount,
        }),
      },
      PREVIEWS_ERROR: {
        CREATE_EXCALIDRAW: () => ({
          state: "CREATING_EXCALIDRAW",
          excalidraws: {},
          showCount: 0,
        }),
      },
      CREATE_EXCALIDRAW_ERROR: {
        CREATE_EXCALIDRAW: (_, { excalidraws, showCount }) => ({
          state: "CREATING_EXCALIDRAW",
          excalidraws,
          showCount,
        }),
      },
      EXCALIDRAW_CREATED: {},
    },
    {
      state: "LOADING_PREVIEWS",
    }
  );

  if (process.env.NODE_ENV === "development") {
    useDevtools("dashboard", dashboard);
  }

  useEffect(
    () =>
      dashboard.exec({
        LOADING_PREVIEWS: () =>
          storage.getPreviews().resolve(
            (excalidraws) => {
              dashboard.dispatch({
                type: "LOADING_PREVIEWS_SUCCESS",
                excalidraws,
              });
            },
            {
              ERROR: (error) => {
                dashboard.dispatch({
                  type: "LOADING_PREVIEWS_ERROR",
                  error,
                });
              },
            }
          ),
        CREATING_EXCALIDRAW: () =>
          storage.createExcalidraw(auth.context.user.uid).resolve(
            (id) => {
              dashboard.dispatch({
                type: "CREATE_EXCALIDRAW_SUCCESS",
                id,
              });
            },
            {
              ERROR: (error) => {
                dashboard.dispatch({
                  type: "CREATE_EXCALIDRAW_ERROR",
                  error,
                });
              },
            }
          ),
        EXCALIDRAW_CREATED: ({ id }) => {
          history.push(`/${auth.context.user.uid}/${id}`);
        },
      }),
    [dashboard]
  );

  return <context.Provider value={dashboard}>{children}</context.Provider>;
};

const context = React.createContext(
  {} as States<DashboardContext, DashboardAction>
);

export const useDashboard = () => React.useContext(context);
