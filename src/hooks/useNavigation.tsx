import { Dispatch, useEffect, useReducer } from "react";
import { StorageEvent } from "../environment-interface/storage";
import { useEnvironment } from "../environment-interface";
import { transition, useEnterState } from "react-states";
import { useDevtools } from "react-states/devtools";

import { useAuthenticatedAuth } from "./useAuth";
import { registerHook } from ".";
import { useCurrentPage } from "./useCurrentPage";
import { Page, RouterEvent } from "../environment-interface/router";

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
      type: "SHOW_MY_EXCALIDRAWS";
    };

const reducer = (
  prevState: NavigationState,
  action: NavigationAction | StorageEvent | RouterEvent
) =>
  transition(prevState, action, {
    ALL_EXCALIDRAWS: {
      CREATE_EXCALIDRAW: (state) => ({
        ...state,
        state: "CREATING_EXCALIDRAW",
      }),
      SHOW_MY_EXCALIDRAWS: () => ({
        state: "USER_EXCALIDRAWS",
      }),
    },
    USER_EXCALIDRAWS: {
      CREATE_EXCALIDRAW: (state) => ({
        ...state,
        state: "CREATING_EXCALIDRAW",
      }),
      SHOW_ALL_EXCALIDRAWS: () => ({
        state: "ALL_EXCALIDRAWS",
      }),
    },
    CREATING_EXCALIDRAW: {
      "STORAGE:CREATE_EXCALIDRAW_SUCCESS": (state, { id }) => ({
        ...state,
        state: "EXCALIDRAW_CREATED",
        id,
      }),
      "STORAGE:CREATE_EXCALIDRAW_ERROR": (state, { error }) => ({
        ...state,
        state: "CREATE_EXCALIDRAW_ERROR",
        error,
      }),
    },
    CREATE_EXCALIDRAW_ERROR: {
      CREATE_EXCALIDRAW: (state) => ({
        ...state,
        state: "CREATING_EXCALIDRAW",
      }),
    },
    EXCALIDRAW_CREATED: {},
  });

function getInitialStateFromCurrentPage(page: Page) {}

export const useNavigation = registerHook(
  ({ navigationState }): [NavigationState, Dispatch<NavigationAction>] => {
    const auth = useAuthenticatedAuth();
    const { storage, router } = useEnvironment();
    const currentPage = useCurrentPage();
    const navigationReducer = useReducer(
      reducer,
      navigationState || {
        state: "ALL_EXCALIDRAWS",
      }
    );

    useDevtools("navigation", navigationReducer);

    const [state, dispatch] = navigationReducer;

    useEffect(() => storage.subscribe(dispatch), []);
    useEffect(() => router.subscribe(dispatch), []);

    useEnterState(state, "CREATING_EXCALIDRAW", () =>
      storage.createExcalidraw(auth.user.uid)
    );

    useEnterState(state, "EXCALIDRAW_CREATED", ({ id }) => {
      router.open({
        name: "EXCALIDRAW",
        userId: auth.user.uid,
        excalidrawId: id,
      });
    });

    useEnterState(state, "ALL_EXCALIDRAWS", () => {
      router.open({
        name: "ALL_EXCALIDRAWS",
      });
    });

    useEnterState(state, "USER_EXCALIDRAWS", () => {
      router.open({
        name: "USER_EXCALIDRAWS",
        userId: auth.user.uid,
      });
    });

    return navigationReducer;
  }
);
