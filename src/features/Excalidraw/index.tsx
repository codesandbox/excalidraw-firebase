import React, { useReducer } from "react";
import { useDevtools } from "react-states/devtools";
import { excalidrawReducer } from "./reducer";
import { ExcalidrawContext, PublicExcalidrawEvent } from "./types";
import {
  useClipboardEffect,
  useStorageEffects,
  useSubscriptionEffect,
} from "./effects";
import { createContext, createHook, useEvents } from "react-states";
import { useEnvironment } from "../../environment";

export * from "./types";

const excalidrawContext = createContext<
  ExcalidrawContext,
  PublicExcalidrawEvent
>();

export const useExcalidraw = createHook(excalidrawContext);

export type Props = {
  id: string;
  userId: string;
  children: React.ReactNode;
  initialContext?: ExcalidrawContext;
};

export const ExcalidrawFeature = ({
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
  initialContext?: ExcalidrawContext;
}) => {
  const { storage, visibility } = useEnvironment();
  const excalidrawStates = useReducer(excalidrawReducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("excalidraw", excalidrawStates);
  }

  const [excalidraw, send] = excalidrawStates;

  useEvents(storage.events, send);
  useEvents(visibility.events, send);

  useClipboardEffect(excalidraw);
  useStorageEffects(userId, id, excalidrawStates);
  useSubscriptionEffect(userId, id, excalidrawStates);

  return (
    <excalidrawContext.Provider value={excalidrawStates}>
      {children}
    </excalidrawContext.Provider>
  );
};
