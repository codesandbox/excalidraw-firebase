import React, { createContext } from "react";
import { States, StatesTransition, useStateEffect } from "react-states";
import { ExcalidrawPreviews } from "../../environment-interface/storage";
import {
  useEnvironment,
  createReducer,
  useReducer,
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

export type Feature = States<State, any>;

type Transition = StatesTransition<Feature>;

const featureContext = createContext({} as Feature);

const reducer = createReducer<Feature>({
  LOADING_PREVIEWS: {
    "STORAGE:FETCH_PREVIEWS_SUCCESS": (_, { excalidraws }): Transition => ({
      state: "PREVIEWS_LOADED",
      excalidraws,
    }),
    "STORAGE:FETCH_PREVIEWS_ERROR": (_, { error }): Transition => ({
      state: "PREVIEWS_ERROR",
      error,
    }),
  },
  PREVIEWS_LOADED: {},
  PREVIEWS_ERROR: {},
});

export const useFeature = () => React.useContext(featureContext);

export const FeatureProvider = ({
  children,
  initialState = {
    state: "LOADING_PREVIEWS",
  },
}: {
  children: React.ReactNode;
  initialState?: State;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer("Dashboard", reducer, initialState);
  const [state] = feature;

  useStateEffect(state, "LOADING_PREVIEWS", () => storage.fetchPreviews());

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
