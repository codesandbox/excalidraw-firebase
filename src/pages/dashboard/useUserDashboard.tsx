import React, { createContext, Dispatch, useEffect, useReducer } from "react";
import { transition, useDevtools, useStateEffect } from "react-states";
import { useEnvironment } from "../../environment-interface";
import {
  ExcalidrawPreviews,
  StorageEvent,
} from "../../environment-interface/storage";

export type UserDashboardState =
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

export type UserDashboardAction = {
  type: "CREATE_EXCALIDRAW";
};

const reducer = (
  state: UserDashboardState,
  action: UserDashboardAction | StorageEvent
) =>
  transition(state, action, {
    LOADING_PREVIEWS: {
      "STORAGE:FETCH_USER_PREVIEWS_SUCCESS": (
        _,
        { excalidraws }
      ): UserDashboardState => ({
        state: "PREVIEWS_LOADED",
        excalidraws,
      }),
      "STORAGE:FETCH_USER_PREVIEWS_ERROR": (
        _,
        { error }
      ): UserDashboardState => ({
        state: "PREVIEWS_ERROR",
        error,
      }),
    },
    PREVIEWS_LOADED: {},
    PREVIEWS_ERROR: {},
  });

export const useUserDashboard = ({
  uid,
  initialState = {
    state: "LOADING_PREVIEWS",
  },
}: {
  uid: string;
  initialState?: UserDashboardState;
}): [UserDashboardState, Dispatch<UserDashboardAction>] => {
  const { storage } = useEnvironment();
  const userDashboardReducer = useReducer(reducer, initialState);

  useDevtools("dashboard", userDashboardReducer);

  const [state, dispatch] = userDashboardReducer;

  useEffect(() => storage.subscribe(dispatch), []);

  useStateEffect(state, "LOADING_PREVIEWS", () =>
    storage.fetchUserPreviews(uid)
  );

  return userDashboardReducer;
};
