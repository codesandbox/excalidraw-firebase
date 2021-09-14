import React, { createContext, useReducer } from "react";
import {
  createReducer,
  PickState,
  States,
  StatesTransition,
  useStateEffect,
  useSubsription,
} from "react-states";
import { ExcalidrawPreviews, StorageAction } from "../../environment/storage";
import { useEnvironment } from "../../environment";
import { useDevtools } from "react-states/devtools";

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

export type PublicAction = {
  type: "CREATE_EXCALIDRAW";
};

export type PublicFeature = States<State, PublicAction>;

export type Feature = States<State, PublicAction | StorageAction>;

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

const featureContext = createContext({} as PublicFeature);

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
  const feature = useReducer(reducer, initialState);

  if (process.env.NODE_ENV === "development") {
    useDevtools("dashboard", feature);
  }

  const [state, dispatch] = feature;

  useSubsription(storage.subscription, dispatch);

  useStateEffect(state, "LOADING_PREVIEWS", () =>
    storage.fetchUserPreviews(uid)
  );

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
