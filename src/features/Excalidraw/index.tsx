import React, { createContext, useReducer } from "react";
import { useDevtools } from "react-states/devtools";
import { reducer } from "./reducer";
import { ExcalidrawAction, ExcalidrawContext } from "./types";
import {
  useClipboardEffect,
  useStorageEffects,
  useSubscriptionEffect,
  useVisibilityChangeEffect,
} from "./effects";
import { createTransitionsReducerHook, TransitionsReducer } from "react-states";

export * from "./types";

const reducerContext = createContext(
  {} as TransitionsReducer<ExcalidrawContext, ExcalidrawAction>
);

export const useExcalidraw = createTransitionsReducerHook(reducerContext);

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
}: Props) => {
  const excalidraw = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("excalidraw", excalidraw);
  }

  const [context, send] = excalidraw;

  useVisibilityChangeEffect(send);
  useClipboardEffect(context);
  useStorageEffects(userId, id, excalidraw);
  useSubscriptionEffect(userId, id, excalidraw);

  return (
    <reducerContext.Provider value={excalidraw}>
      {children}
    </reducerContext.Provider>
  );
};
