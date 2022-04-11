import React, { createContext, useContext } from "react";
import {
  States,
  StatesTransition,
  useCommandEffect,
  useStateEffect,
} from "react-states";
import {
  useEnvironment,
  useReducer,
  createReducer,
} from "../../environment-interface";
import { LoomVideo } from "../../environment-interface/loom";

export type State =
  | {
      state: "DISABLED";
    }
  | {
      state: "NOT_CONFIGURED";
      apiKey: string;
      buttonId: "loom-record";
    }
  | {
      state: "READY";
    }
  | {
      state: "RECORDING";
    };

type Command = {
  cmd: "OPEN_VIDEO";
  video: LoomVideo;
};

type Action = {
  type: "RECORD";
};

export type Feature = States<State, Action, Command>;

type Transition = StatesTransition<Feature>;

const featureContext = createContext({} as Feature);

const reducer = createReducer<Feature>({
  DISABLED: {},
  NOT_CONFIGURED: {
    "LOOM:CONFIGURED": (state): Transition => ({
      ...state,
      state: "READY",
    }),
  },
  READY: {
    "LOOM:INSERT": (state, { video }): Transition => [
      state,
      {
        cmd: "OPEN_VIDEO",
        video,
      },
    ],
    "LOOM:START": (): Transition => ({
      state: "RECORDING",
    }),
  },
  RECORDING: {
    "LOOM:CANCEL": (): Transition => ({
      state: "READY",
    }),
    "LOOM:COMPLETE": (): Transition => ({
      state: "READY",
    }),
  },
});

export const useFeature = () => useContext(featureContext);

export const Feature = ({
  children,
  apiKey,
  initialState = apiKey
    ? {
        state: "NOT_CONFIGURED",
        apiKey,
        buttonId: "loom-record",
      }
    : {
        state: "DISABLED",
      },
}: {
  children: React.ReactNode;
  apiKey: string | null;
  initialState?: State;
}) => {
  const { loom } = useEnvironment();
  const feature = useReducer("Recording", reducer, initialState);

  const [state] = feature;

  useStateEffect(state, "NOT_CONFIGURED", ({ apiKey, buttonId }) => {
    loom.configure(apiKey, buttonId);
  });

  useCommandEffect(state, "OPEN_VIDEO", ({ video }) => {
    loom.openVideo(video);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
