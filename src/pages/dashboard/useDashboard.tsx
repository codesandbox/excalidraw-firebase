import { Dispatch, useEffect, useReducer } from "react";
import { transition, useDevtools, useStateEffect } from "react-states";
import { useEnvironment } from "../../environment-interface";
import {
  ExcalidrawPreviews,
  StorageEvent,
} from "../../environment-interface/storage";

export type DashboardState =
  | {
      state: "LOADING_PREVIEWS";
    }
  | {
      state: "PREVIEWS_LOADED";
      excalidraws: ExcalidrawPreviews;
    }
  | {
      state: "PREVIEWS_ERROR";
      error: string;
    };

const reducer = (state: DashboardState, action: StorageEvent) =>
  transition(state, action, {
    LOADING_PREVIEWS: {
      "STORAGE:FETCH_PREVIEWS_SUCCESS": (
        _,
        { excalidraws }
      ): DashboardState => ({
        state: "PREVIEWS_LOADED",
        excalidraws,
      }),
      "STORAGE:FETCH_PREVIEWS_ERROR": (_, { error }): DashboardState => ({
        state: "PREVIEWS_ERROR",
        error,
      }),
    },
    PREVIEWS_LOADED: {},
    PREVIEWS_ERROR: {},
  });

export const useDashboard = (
  initialState: DashboardState = {
    state: "LOADING_PREVIEWS",
  }
): DashboardState => {
  const { storage } = useEnvironment();
  const dashboardReducer = useReducer(reducer, initialState);

  useDevtools("dashboard", dashboardReducer);

  const [state, dispatch] = dashboardReducer;

  useEffect(() => storage.subscribe(dispatch), []);

  useStateEffect(state, "LOADING_PREVIEWS", () => storage.fetchPreviews());

  return state;
};
