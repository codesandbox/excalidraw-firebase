import React, { createContext, useContext } from "react";
import { reducer } from "./reducer";
import { State, Feature } from "./types";
import { useEnvironment, useReducer } from "../../environment-interface";
import { useCommandEffect, useStateEffect } from "react-states";

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
  const { storage, copyImageToClipboard } = useEnvironment();
  const feature = useReducer("Excalidraw", reducer, initialState);
  const [state, dispatch] = feature;

  useCommandEffect(state, "COPY_TO_CLIPBOARD", ({ image }) => {
    copyImageToClipboard(image);
  });

  useStateEffect(state, "LOADING", () => storage.fetchExcalidraw(userId, id));

  useStateEffect(state, "SYNCING", ({ data }) => {
    storage.saveExcalidraw(userId, id, data);
  });

  useCommandEffect(state, "SAVE_TITLE", ({ title }) => {
    storage.saveTitle(userId, id, title);
  });

  useStateEffect(state, "DIRTY", () => {
    const id = setTimeout(() => {
      dispatch({
        type: "SYNC",
      });
    }, 500);

    return () => {
      clearTimeout(id);
    };
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
