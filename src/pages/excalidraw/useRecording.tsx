import React, { Dispatch, useEffect, useReducer } from "react";
import {
  transition,
  useDevtools,
  useStateEffect,
  useTransitionEffect,
} from "react-states";
import { useEnvironment } from "../../environment-interface";

import { LoomEvent, LoomVideo } from "../../environment-interface/loom";

export type RecordingState =
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

type RecordingAction = {
  type: "RECORD";
};

const reducer = (state: RecordingState, action: RecordingAction | LoomEvent) =>
  transition(state, action, {
    DISABLED: {},
    NOT_CONFIGURED: {
      "LOOM:CONFIGURED": (state): RecordingState => ({
        ...state,
        state: "READY",
      }),
    },
    READY: {
      "LOOM:INSERT": (state): RecordingState => ({
        ...state,
      }),
      "LOOM:START": (): RecordingState => ({
        state: "RECORDING",
      }),
    },
    RECORDING: {
      "LOOM:CANCEL": (): RecordingState => ({
        state: "READY",
      }),
      "LOOM:COMPLETE": (): RecordingState => ({
        state: "READY",
      }),
    },
  });

export const useRecording = ({
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
  apiKey: string | null;
  initialState?: RecordingState;
}): [RecordingState, Dispatch<RecordingAction>] => {
  const { loom } = useEnvironment();
  const recording = useReducer(reducer, initialState);

  useDevtools("recording", recording);

  const [state, dispatch] = recording;

  useEffect(() => loom.subscribe(dispatch), []);

  useTransitionEffect(state, "NOT_CONFIGURED", ({ apiKey, buttonId }) => {
    loom.configure(apiKey, buttonId);
  });

  useTransitionEffect(state, "READY", "READY", (_, action) => {
    if (action.type === "LOOM:INSERT") {
      loom.openVideo(action.video);
    }
  });

  return recording;
};
