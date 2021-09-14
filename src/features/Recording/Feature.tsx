import React, { createContext, useContext, useReducer } from "react";
import {
  createReducer,
  States,
  StatesTransition,
  useCommandEffect,
  useStateEffect,
  useSubsription,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { LoomAction, LoomVideo } from "../../environment/loom";

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

type PublicAction = {
  type: "RECORD";
};

export type PublicFeature = States<State, PublicAction>;

export type Feature = States<State, PublicAction | LoomAction, Command>;

type Transition = StatesTransition<Feature>;

const featureContext = createContext({} as PublicFeature);

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
  const feature = useReducer(reducer, initialState);

  if (process.env.NODE_ENV === "development") {
    useDevtools("recording", feature);
  }

  const [state, dispatch] = feature;

  useSubsription(loom.subscription, dispatch);

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
