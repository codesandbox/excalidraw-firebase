import React, { createContext, useReducer } from "react";
import {
  createReducer,
  PickState,
  States,
  StatesTransition,
  useStateEffect,
  useSubsription,
} from "react-states";
import { StorageAction } from "../../environment/storage";
import { useEnvironment } from "../../environment";
import { useDevtools } from "react-states/devtools";
import { Auth } from "../Auth";
import confetti from "canvas-confetti";

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

export type PublicAction =
  | {
      type: "CREATE_EXCALIDRAW";
    }
  | {
      type: "SHOW_ALL_EXCALIDRAWS";
    }
  | {
      type: "SHOW_MY_EXCALIDRAWSS";
    };

export type PublicFeature = States<State, PublicAction>;

export type Feature = States<State, PublicAction | StorageAction>;

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

const featureContext = createContext({} as PublicFeature);

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
  auth: PickState<Auth, "AUTHENTICATED">;
  navigate: (url: string) => void;
  initialState?: State;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer(reducer, initialState);

  if (process.env.NODE_ENV === "development") {
    useDevtools("navigation", feature);
  }

  const [state, dispatch] = feature;

  useSubsription(storage.subscription, dispatch);

  useStateEffect(state, "CREATING_EXCALIDRAW", () =>
    storage.createExcalidraw(auth.user.uid)
  );

  useStateEffect(state, "EXCALIDRAW_CREATED", ({ id }) => {
    confetti({
      particleCount: 150,
    });
    setTimeout(() => {
      navigate(`/${auth.user.uid}/${id}`);
    }, 500);
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
