import React, { createContext, useContext, useReducer } from "react";
import { useDevtools } from "react-states/devtools";
import { reducer } from "./reducer";
import { State, Feature } from "./types";
import { useClipboardEffect, useStorageEffects } from "./effects";
import { useSubsription } from "react-states";
import { useEnvironment } from "../../environment";

export * from "./types";

const featureContext = createContext({} as Feature);

export const useFeature = () => useContext(featureContext);

export const FeatureProvider = ({
  id,
  userId,
  children,
  initialState = {
    state: "LOADING",
  },
}: {
  id: string;
  userId: string;
  children: React.ReactNode;
  initialState?: State;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer(reducer, initialState);

  if (process.env.NODE_ENV === "development") {
    useDevtools("excalidraw", feature);
  }

  const [, dispatch] = feature;

  useSubsription(storage.subscription, dispatch);

  useClipboardEffect(feature);
  useStorageEffects(userId, id, feature);

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
