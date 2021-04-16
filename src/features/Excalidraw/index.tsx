import React, { createContext, useContext, useReducer } from "react";
import { useDevtools } from "react-states/devtools";
import { reducer } from "./reducer";
import { ExcalidrawContext, ExcalidrawReducer } from "./types";
import {
  useClipboardEffect,
  useStorageEffects,
  useSubscriptionEffect,
  useVisibilityChangeEffect,
} from "./effects";

export * from "./types";

const context = createContext({} as ExcalidrawReducer);

export const useExcalidraw = () => useContext(context);

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
  const excalidraw = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("excalidraw", excalidraw);
  }

  useVisibilityChangeEffect(excalidraw);
  useClipboardEffect(excalidraw);
  useStorageEffects(userId, id, excalidraw);
  useSubscriptionEffect(userId, id, excalidraw);

  return <context.Provider value={excalidraw}>{children}</context.Provider>;
};
