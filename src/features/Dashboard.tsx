import React, { useEffect } from "react";
import { States, useStates } from "react-states";
import { useAuthenticatedAuth } from "./Auth";
import { ExcalidrawMetadata } from "../types";
import { useEnvironment } from "../environment";
import { useDevtools } from "react-states/devtools";

export type Context =
  | {
      state: "LOADING_PREVIEWS";
    }
  | {
      state: "PREVIEWS_LOADED";
      excalidraws: ExcalidrawMetadata[];
      showCount: number;
    }
  | {
      state: "CREATING_EXCALIDRAW";
      excalidraws: ExcalidrawMetadata[];
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
      excalidraws: ExcalidrawMetadata[];
      showCount: number;
      error: string;
    };

export type Action =
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
      excalidraws: ExcalidrawMetadata[];
    }
  | {
      type: "LOADING_PREVIEWS_ERROR";
      error: string;
    };

const context = React.createContext({} as States<Context, Action>);

export const useDashboard = () => React.useContext(context);

export const DashboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const auth = useAuthenticatedAuth();
  const { router, storage } = useEnvironment();
  const dashboard = useStates<Context, Action>(
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
          excalidraws: [],
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

  if (!import.meta.env.PROD) {
    useDevtools("dashboard", dashboard);
  }

  useEffect(
    () =>
      dashboard.exec({
        LOADING_PREVIEWS: function getPreviews() {
          storage
            .getPreviews(auth.context.user.uid)
            .then((excalidraws) => {
              dashboard.dispatch({
                type: "LOADING_PREVIEWS_SUCCESS",
                excalidraws,
              });
            })
            .catch((error) => {
              dashboard.dispatch({
                type: "LOADING_PREVIEWS_ERROR",
                error: error.message,
              });
            });
        },
        CREATING_EXCALIDRAW: () => {
          storage
            .createExcalidraw(auth.context.user.uid)
            .then((id) => {
              dashboard.dispatch({
                type: "CREATE_EXCALIDRAW_SUCCESS",
                id,
              });
            })
            .catch((error) => {
              dashboard.dispatch({
                type: "CREATE_EXCALIDRAW_ERROR",
                error: error.message,
              });
            });
        },
        EXCALIDRAW_CREATED: ({ id }) => {
          router.navigate(`/${auth.context.user.uid}/${id}`);
        },
      }),
    [dashboard]
  );

  return <context.Provider value={dashboard}>{children}</context.Provider>;
};
