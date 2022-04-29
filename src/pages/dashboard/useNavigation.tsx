import React, { createContext, Dispatch, useEffect, useReducer } from "react";
import { StorageEvent } from "../../environment-interface/storage";
import { useEnvironment } from "../../environment-interface";
import {
  PickState,
  transition,
  useDevtools,
  useStateEffect,
} from "react-states";

import { useAuthenticatedAuth } from "../useAuth";

export type NavigationState =
  | {
      state: "ALL_EXCALIDRAWS";
    }
  | {
      state: "USER_EXCALIDRAWS";
    }
  | {
      state: "CREATING_EXCALIDRAW";
    }
  | {
      state: "EXCALIDRAW_CREATED";
      id: string;
    }
  | {
      state: "CREATE_EXCALIDRAW_ERROR";
      error: string;
    };

export type NavigationAction =
  | {
      type: "CREATE_EXCALIDRAW";
    }
  | {
      type: "SHOW_ALL_EXCALIDRAWS";
    }
  | {
      type: "SHOW_MY_EXCALIDRAWSS";
    };

const reducer = (
  state: NavigationState,
  action: NavigationAction | StorageEvent
) =>
  transition(state, action, {
    ALL_EXCALIDRAWS: {
      CREATE_EXCALIDRAW: (state): NavigationState => ({
        ...state,
        state: "CREATING_EXCALIDRAW",
      }),
      SHOW_MY_EXCALIDRAWSS: (): NavigationState => ({
        state: "USER_EXCALIDRAWS",
      }),
    },
    USER_EXCALIDRAWS: {
      CREATE_EXCALIDRAW: (state): NavigationState => ({
        ...state,
        state: "CREATING_EXCALIDRAW",
      }),
      SHOW_ALL_EXCALIDRAWS: (): NavigationState => ({
        state: "ALL_EXCALIDRAWS",
      }),
    },
    CREATING_EXCALIDRAW: {
      "STORAGE:CREATE_EXCALIDRAW_SUCCESS": (
        state,
        { id }
      ): NavigationState => ({
        ...state,
        state: "EXCALIDRAW_CREATED",
        id,
      }),
      "STORAGE:CREATE_EXCALIDRAW_ERROR": (
        state,
        { error }
      ): NavigationState => ({
        ...state,
        state: "CREATE_EXCALIDRAW_ERROR",
        error,
      }),
    },
    CREATE_EXCALIDRAW_ERROR: {
      CREATE_EXCALIDRAW: (state): NavigationState => ({
        ...state,
        state: "CREATING_EXCALIDRAW",
      }),
    },
    EXCALIDRAW_CREATED: {},
  });

export const useNavigation = ({
  initialState = {
    state: "ALL_EXCALIDRAWS",
  },
  navigate,
}: {
  navigate: (url: string) => void;
  initialState?: NavigationState;
}): [NavigationState, Dispatch<NavigationAction>] => {
  const auth = useAuthenticatedAuth();
  const { storage } = useEnvironment();
  const navigationReducer = useReducer(reducer, initialState);

  useDevtools("navigation", navigationReducer);

  const [state, dispatch] = navigationReducer;

  useEffect(() => storage.subscribe(dispatch), []);

  useStateEffect(state, "CREATING_EXCALIDRAW", () =>
    storage.createExcalidraw(auth.user.uid)
  );

  useStateEffect(state, "EXCALIDRAW_CREATED", ({ id }) => {
    navigate(`/${auth.user.uid}/${id}`);
  });

  useStateEffect(state, "ALL_EXCALIDRAWS", () => {
    navigate("/");
  });

  useStateEffect(state, "USER_EXCALIDRAWS", () => {
    navigate(`/${auth.user.uid}`);
  });

  return navigationReducer;
};
