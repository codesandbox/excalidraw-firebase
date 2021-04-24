import React, { useEffect, useReducer } from "react";
import {
  exec,
  createStatesHook,
  createStatesContext,
  createStatesReducer,
} from "react-states";
import { ExcalidrawsByUser } from "../../environment/storage";
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

const CREATE_EXCALIDRAW_SUCCESS = Symbol("CREATE_EXCALIDRAW_SUCCESS");
const CREATE_EXCALIDRAW_ERROR = Symbol("CREATE_EXCALIDRAW_ERROR");
const LOADING_PREVIEWS_SUCCESS = Symbol("LOADING_PREVIEWS_SUCCESS");
const LOADING_PREVIEWS_ERROR = Symbol("LOADING_PREVIEWS_ERROR");

export type DashboardEvent =
  | {
      type: "CREATE_EXCALIDRAW";
    }
  | {
      type: typeof CREATE_EXCALIDRAW_SUCCESS;
      id: string;
    }
  | {
      type: typeof CREATE_EXCALIDRAW_ERROR;
      error: string;
    }
  | {
      type: typeof LOADING_PREVIEWS_SUCCESS;
      excalidraws: ExcalidrawsByUser;
    }
  | {
      type: typeof LOADING_PREVIEWS_ERROR;
      error: string;
    };

const dashboardReducer = createStatesReducer<DashboardContext, DashboardEvent>({
  LOADING_PREVIEWS: {
    [LOADING_PREVIEWS_SUCCESS]: ({ excalidraws }): DashboardContext => ({
      state: "PREVIEWS_LOADED",
      excalidraws,
      showCount: 10,
    }),
    [LOADING_PREVIEWS_ERROR]: ({ error }): DashboardContext => ({
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
    [CREATE_EXCALIDRAW_SUCCESS]: ({ id }): DashboardContext => ({
      state: "EXCALIDRAW_CREATED",
      id,
    }),
    [CREATE_EXCALIDRAW_ERROR]: (
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

const dashboardContext = createStatesContext<
  DashboardContext,
  DashboardEvent
>();

export const useDashboard = createStatesHook(dashboardContext);

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

  useEffect(
    () =>
      exec(dashboard, {
        LOADING_PREVIEWS: () =>
          storage.getPreviews().resolve(
            (excalidraws) => {
              send({
                type: LOADING_PREVIEWS_SUCCESS,
                excalidraws,
              });
            },
            {
              ERROR: (error) => {
                send({
                  type: LOADING_PREVIEWS_ERROR,
                  error,
                });
              },
            }
          ),
        CREATING_EXCALIDRAW: () =>
          storage.createExcalidraw(auth.user.uid).resolve(
            (id) => {
              send({
                type: CREATE_EXCALIDRAW_SUCCESS,
                id,
              });
            },
            {
              ERROR: (error) => {
                send({
                  type: CREATE_EXCALIDRAW_ERROR,
                  error,
                });
              },
            }
          ),
        EXCALIDRAW_CREATED: ({ id }) => {
          history.push(`/${auth.user.uid}/${id}`);
        },
      }),
    [dashboard]
  );

  return (
    <dashboardContext.Provider value={dashboardStates}>
      {children}
    </dashboardContext.Provider>
  );
};
