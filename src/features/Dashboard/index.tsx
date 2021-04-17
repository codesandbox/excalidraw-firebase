import React, { useEffect, useReducer } from "react";
import { exec, StatesReducer } from "react-states";
import { ExcalidrawsByUser } from "../../environment/storage";
import { useEnvironment } from "../../environment";
import { useDevtools } from "react-states/devtools";
import { useHistory } from "react-router";
import { useAuthenticatedAuth } from "../Auth";
import { transitions } from "react-states/cjs";

export type DashboardContext =
  | {
      state: "LOADING_PREVIEWS";
    }
  | {
      state: "PREVIEWS_LOADED";
      excalidraws: ExcalidrawsByUser;
    }
  | {
      state: "CREATING_EXCALIDRAW";
      excalidraws: ExcalidrawsByUser;
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
      error: string;
    };

const CREATE_EXCALIDRAW_SUCCESS = Symbol("CREATE_EXCALIDRAW_SUCCESS");
const CREATE_EXCALIDRAW_ERROR = Symbol("CREATE_EXCALIDRAW_ERROR");
const LOADING_PREVIEWS_SUCCESS = Symbol("LOADING_PREVIEWS_SUCCESS");
const LOADING_PREVIEWS_ERROR = Symbol("LOADING_PREVIEWS_ERROR");

export type DashboardAction =
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

export type DashboardReducer = StatesReducer<DashboardContext, DashboardAction>;

const context = React.createContext({} as DashboardReducer);

export const useDashboard = () => React.useContext(context);

const reducer = transitions<DashboardContext, DashboardAction>({
  LOADING_PREVIEWS: {
    [LOADING_PREVIEWS_SUCCESS]: ({ excalidraws }): DashboardContext => ({
      state: "PREVIEWS_LOADED",
      excalidraws,
    }),
    [LOADING_PREVIEWS_ERROR]: ({ error }): DashboardContext => ({
      state: "PREVIEWS_ERROR",
      error,
    }),
  },
  PREVIEWS_LOADED: {
    CREATE_EXCALIDRAW: (_, { excalidraws }): DashboardContext => ({
      state: "CREATING_EXCALIDRAW",
      excalidraws,
    }),
  },
  CREATING_EXCALIDRAW: {
    [CREATE_EXCALIDRAW_SUCCESS]: ({ id }): DashboardContext => ({
      state: "EXCALIDRAW_CREATED",
      id,
    }),
    [CREATE_EXCALIDRAW_ERROR]: (
      { error },
      { excalidraws }
    ): DashboardContext => ({
      state: "CREATE_EXCALIDRAW_ERROR",
      error,
      excalidraws,
    }),
  },
  PREVIEWS_ERROR: {
    CREATE_EXCALIDRAW: (): DashboardContext => ({
      state: "CREATING_EXCALIDRAW",
      excalidraws: {},
    }),
  },
  CREATE_EXCALIDRAW_ERROR: {
    CREATE_EXCALIDRAW: (_, { excalidraws }): DashboardContext => ({
      state: "CREATING_EXCALIDRAW",
      excalidraws,
    }),
  },
  EXCALIDRAW_CREATED: {},
});

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
  const [auth] = useAuthenticatedAuth();
  const { storage } = useEnvironment();
  const dashboardReducer = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("dashboard", dashboardReducer);
  }

  const [dashboard, dispatch] = dashboardReducer;

  useEffect(
    () =>
      exec(dashboard, {
        LOADING_PREVIEWS: () =>
          storage.getPreviews().resolve(
            (excalidraws) => {
              dispatch({
                type: LOADING_PREVIEWS_SUCCESS,
                excalidraws,
              });
            },
            {
              ERROR: (error) => {
                dispatch({
                  type: LOADING_PREVIEWS_ERROR,
                  error,
                });
              },
            }
          ),
        CREATING_EXCALIDRAW: () =>
          storage.createExcalidraw(auth.user.uid).resolve(
            (id) => {
              dispatch({
                type: CREATE_EXCALIDRAW_SUCCESS,
                id,
              });
            },
            {
              ERROR: (error) => {
                dispatch({
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
    <context.Provider value={dashboardReducer}>{children}</context.Provider>
  );
};
