import React, {
  createContext,
  Dispatch,
  useContext,
  useEffect,
  useReducer,
} from "react";

import { reducer } from "./reducer";
import { ExcalidrawAction, ExcalidrawState } from "./types";

import { useEnvironment } from "../../../environment-interface";
import { useCommandEffect, useDevtools, useStateEffect } from "react-states";

export const useExcalidraw = ({
  id,
  userId,

  initialState = {
    state: "LOADING",
  },
}: {
  id: string;
  userId: string;

  initialState?: ExcalidrawState;
}): [ExcalidrawState, Dispatch<ExcalidrawAction>] => {
  const { storage, copyImageToClipboard } = useEnvironment();
  const excalidrawReducer = useReducer(reducer, initialState);

  useDevtools("excalidraw", excalidrawReducer);

  const [state, dispatch] = excalidrawReducer;

  useEffect(() => storage.subscribe(dispatch), []);

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

  return excalidrawReducer;
};
