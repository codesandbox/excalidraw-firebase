import { Dispatch, useEffect, useReducer } from "react";
import { transition, useStateTransition, useDevtools } from "react-states";

import { useEnvironment } from "../../environment-interface";

import { LoomEvent } from "../../environment-interface/loom";

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

  useStateTransition(state, "NOT_CONFIGURED", ({ apiKey, buttonId }) => {
    loom.configure(apiKey, buttonId);
  });

  useStateTransition(
    state,
    {
      READY: {
        "LOOM:INSERT": "READY",
      },
    },
    (_, { video }) => {
      loom.openVideo(video);
    }
  );

  return recording;
};
