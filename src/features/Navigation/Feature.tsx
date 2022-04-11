import React, { createContext } from "react";
import {
  PickState,
  States,
  StatesTransition,
  useStateEffect,
} from "react-states";

import {
  useEnvironment,
  useReducer,
  createReducer,
} from "../../environment-interface";

import { AuthFeature } from "../Auth";

export type State =
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

export type Action =
  | {
      type: "CREATE_EXCALIDRAW";
    }
  | {
      type: "SHOW_ALL_EXCALIDRAWS";
    }
  | {
      type: "SHOW_MY_EXCALIDRAWSS";
    };

export type Feature = States<State, Action>;

type Transition = StatesTransition<Feature>;

const reducer = createReducer<Feature>({
  ALL_EXCALIDRAWS: {
    CREATE_EXCALIDRAW: (state): Transition => ({
      ...state,
      state: "CREATING_EXCALIDRAW",
    }),
    SHOW_MY_EXCALIDRAWSS: (): Transition => ({
      state: "USER_EXCALIDRAWS",
    }),
  },
  USER_EXCALIDRAWS: {
    CREATE_EXCALIDRAW: (state): Transition => ({
      ...state,
      state: "CREATING_EXCALIDRAW",
    }),
    SHOW_ALL_EXCALIDRAWS: (): Transition => ({
      state: "ALL_EXCALIDRAWS",
    }),
  },
  CREATING_EXCALIDRAW: {
    "STORAGE:CREATE_EXCALIDRAW_SUCCESS": (state, { id }): Transition => ({
      ...state,
      state: "EXCALIDRAW_CREATED",
      id,
    }),
    "STORAGE:CREATE_EXCALIDRAW_ERROR": (state, { error }): Transition => ({
      ...state,
      state: "CREATE_EXCALIDRAW_ERROR",
      error,
    }),
  },
  CREATE_EXCALIDRAW_ERROR: {
    CREATE_EXCALIDRAW: (state): Transition => ({
      ...state,
      state: "CREATING_EXCALIDRAW",
    }),
  },
  EXCALIDRAW_CREATED: {},
});

const featureContext = createContext({} as Feature);

export const useFeature = () => React.useContext(featureContext);

export const FeatureProvider = ({
  children,
  auth,
  initialState = {
    state: "ALL_EXCALIDRAWS",
  },
  navigate,
}: {
  children: React.ReactNode;
  auth: PickState<AuthFeature, "AUTHENTICATED">;
  navigate: (url: string) => void;
  initialState?: State;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer("Navigation", reducer, initialState);
  const [state] = feature;

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

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
