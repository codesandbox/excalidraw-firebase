import React, { createContext } from "react";
import { States, StatesTransition, useStateEffect } from "react-states";
import { ExcalidrawPreviews } from "../../environment-interface/storage";
import {
  useEnvironment,
  useReducer,
  createReducer,
} from "../../environment-interface";

export type State =
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

export type Action = {
  type: "CREATE_EXCALIDRAW";
};

export type Feature = States<State, Action>;

type Transition = StatesTransition<Feature>;

const reducer = createReducer<Feature>({
  LOADING_PREVIEWS: {
    "STORAGE:FETCH_USER_PREVIEWS_SUCCESS": (
      _,
      { excalidraws }
    ): Transition => ({
      state: "PREVIEWS_LOADED",
      excalidraws,
    }),
    "STORAGE:FETCH_USER_PREVIEWS_ERROR": (_, { error }): Transition => ({
      state: "PREVIEWS_ERROR",
      error,
    }),
  },
  PREVIEWS_LOADED: {},
  PREVIEWS_ERROR: {},
});

const featureContext = createContext({} as Feature);

export const useFeature = () => React.useContext(featureContext);

export const FeatureProvider = ({
  children,
  uid,
  initialState = {
    state: "LOADING_PREVIEWS",
  },
}: {
  children: React.ReactNode;
  uid: string;
  initialState?: State;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer("UserDashboard", reducer, initialState);

  const [state, dispatch] = feature;

  useStateEffect(state, "LOADING_PREVIEWS", () =>
    storage.fetchUserPreviews(uid)
  );

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
