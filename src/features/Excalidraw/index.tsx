import React, { createContext, useContext, useReducer } from "react";
import { useDevtools } from "react-states/devtools";
import { reducer } from "./reducer";
import { ExcalidrawContext, ExcalidrawReducer } from "./types";
import {
  useClipboardEffect,
  useStorageEffects,
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
  const excalidrawReducer = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("excalidraw", excalidrawReducer);
  }

  useVisibilityChangeEffect(excalidrawReducer);
  useClipboardEffect(excalidrawReducer);
  useStorageEffects(userId, id, excalidrawReducer);

  return (
    <context.Provider value={excalidrawReducer}>{children}</context.Provider>
  );
};
