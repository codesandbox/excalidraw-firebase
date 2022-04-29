import React, { Dispatch, useContext, useEffect, useReducer } from "react";
import {
  $COMMAND,
  transition,
  useCommandEffect,
  useDevtools,
  useStateEffect,
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
      [$COMMAND]?: Command;
    }
  | {
      state: "RECORDING";
    };

type Command = {
  cmd: "OPEN_VIDEO";
  video: LoomVideo;
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
      "LOOM:INSERT": (state, { video }): RecordingState => ({
        ...state,
        [$COMMAND]: {
          cmd: "OPEN_VIDEO",
          video,
        },
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

  useStateEffect(state, "NOT_CONFIGURED", ({ apiKey, buttonId }) => {
    loom.configure(apiKey, buttonId);
  });

  useCommandEffect(state, "OPEN_VIDEO", ({ video }) => {
    loom.openVideo(video);
  });

  return recording;
};
