import { Dispatch, useEffect, useReducer } from "react";
import { StorageEvent } from "../environment-interface/storage";
import { useEnvironment } from "../environment-interface";
import { transition, useStateTransition } from "react-states";
import { useDevtools } from "react-states/devtools";

import { useAuthenticatedAuth } from "./useAuth";
import { registerHook } from ".";

export type CreateExcalidrawState =
  | {
      state: "IDLE";
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

export type CreateExcalidrawAction = {
  type: "CREATE_EXCALIDRAW";
};

const reducer = (
  prevState: CreateExcalidrawState,
  action: CreateExcalidrawAction | StorageEvent
) =>
  transition(prevState, action, {
    IDLE: {
      CREATE_EXCALIDRAW: () => ({
        state: "CREATING_EXCALIDRAW",
      }),
    },
    CREATING_EXCALIDRAW: {
      "STORAGE:CREATE_EXCALIDRAW_SUCCESS": (_, { id }) => ({
        state: "EXCALIDRAW_CREATED",
        id,
      }),
      "STORAGE:CREATE_EXCALIDRAW_ERROR": (_, { error }) => ({
        state: "CREATE_EXCALIDRAW_ERROR",
        error,
      }),
    },
    CREATE_EXCALIDRAW_ERROR: {
      CREATE_EXCALIDRAW: () => ({
        state: "CREATING_EXCALIDRAW",
      }),
    },
    EXCALIDRAW_CREATED: {},
  });

export const useNavigation = registerHook(({ navigationState }) => {
  const auth = useAuthenticatedAuth();
  const { storage, router } = useEnvironment();
  const navigationReducer = useReducer(
    reducer,
    navigationState || {
      state: "IDLE",
    }
  );

  useDevtools("navigation", navigationReducer);

  const [state, dispatch] = navigationReducer;

  useEffect(() => storage.subscribe(dispatch), []);

  useStateTransition(state, "CREATING_EXCALIDRAW", () =>
    storage.createExcalidraw(auth.user.uid)
  );

  useStateTransition(state, "EXCALIDRAW_CREATED", ({ id }) => {
    router.open({
      name: "EXCALIDRAW",
      userId: auth.user.uid,
      excalidrawId: id,
    });
  });

  return navigationReducer;
});
