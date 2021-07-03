import React, { useReducer } from "react";
import {
  createContext,
  createHook,
  createReducer,
  useEnterEffect,
  useEvents,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { LoomEvent, LoomVideo } from "../../environment/loom";

export type Context =
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

type TransientContext = {
  state: "OPEN_VIDEO";
  video: LoomVideo;
};

type UIEvent = {
  type: "RECORD";
};

export type Event = UIEvent | LoomEvent;

const featureContext = createContext<Context, UIEvent, TransientContext>();

const reducer = createReducer<Context, Event, TransientContext>(
  {
    DISABLED: {},
    NOT_CONFIGURED: {
      "LOOM:CONFIGURED": (_, context) => ({
        ...context,
        state: "READY",
      }),
    },
    READY: {
      "LOOM:INSERT": ({ video }) => ({
        state: "OPEN_VIDEO",
        video,
      }),
      "LOOM:START": () => ({
        state: "RECORDING",
      }),
    },
    RECORDING: {
      "LOOM:CANCEL": () => ({
        state: "READY",
      }),
      "LOOM:COMPLETE": () => ({
        state: "READY",
      }),
    },
  },
  {
    OPEN_VIDEO: () => ({
      state: "READY",
    }),
  }
);

export const useFeature = createHook(featureContext);

export const Feature = ({
  children,
  apiKey,
  initialContext = apiKey
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
  initialContext?: Context;
}) => {
  const { loom } = useEnvironment();
  const feature = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("recording", feature);
  }

  const [context, send] = feature;

  useEvents(loom.events, send);

  useEnterEffect(context, "NOT_CONFIGURED", ({ apiKey, buttonId }) => {
    loom.configure(apiKey, buttonId);
  });

  useEnterEffect(context, "OPEN_VIDEO", ({ video }) => {
    loom.openVideo(video);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
