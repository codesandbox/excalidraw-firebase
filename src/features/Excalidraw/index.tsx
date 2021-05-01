import React, { useReducer } from "react";
import { useDevtools } from "react-states/devtools";
import { excalidrawReducer } from "./reducer";
import { ExcalidrawEvent, ExcalidrawContext } from "./types";
import {
  useClipboardEffect,
  useStorageEffects,
  useSubscriptionEffect,
  useVisibilityChangeEffect,
} from "./effects";
import { createContext, createHook } from "react-states";

export * from "./types";

const excalidrawContext = createContext<ExcalidrawContext, ExcalidrawEvent>();
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
  const excalidrawStates = useReducer(excalidrawReducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("excalidraw", excalidrawStates);
  }

  const [excalidraw, send] = excalidrawStates;

  useVisibilityChangeEffect(send);
  useClipboardEffect(excalidraw);
  useStorageEffects(userId, id, excalidrawStates);
  useSubscriptionEffect(userId, id, excalidrawStates);

  return (
    <excalidrawContext.Provider value={excalidrawStates}>
      {children}
    </excalidrawContext.Provider>
  );
};
