import React, { useReducer } from "react";
import { useDevtools } from "react-states/devtools";
import { reducer } from "./reducer";
import { Context, UIEvent, TransientContext } from "./types";
import { useClipboardEffect, useStorageEffects } from "./effects";
import { createContext, createHook, useEvents } from "react-states";
import { useEnvironment } from "../../environment";

export * from "./types";

const featureContext = createContext<Context, UIEvent, TransientContext>();

export const useFeature = createHook(featureContext);

export type Props = {
  id: string;
  userId: string;
  children: React.ReactNode;
  initialContext?: Context;
};

export const FeatureProvider = ({
  id,
  userId,
  children,
  initialContext = {
    state: "LOADING",
  },
}: {
  id: string;
  userId: string;
  children: React.ReactNode;
  initialContext?: Context;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("excalidraw", feature);
  }

  const [context, send] = feature;

  useEvents(storage.events, send);

  useClipboardEffect(context);
  useStorageEffects(userId, id, feature);

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
