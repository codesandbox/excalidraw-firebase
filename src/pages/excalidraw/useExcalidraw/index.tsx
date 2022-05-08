import { Dispatch, useEffect, useReducer } from "react";

import { reducer } from "./reducer";
import { ExcalidrawAction, ExcalidrawState } from "./types";

import { useEnvironment } from "../../../environment-interface";
import { useDevtools, useTransitionEffect } from "react-states";

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

  useTransitionEffect(state, "EDIT", "COPY_TO_CLIPBOARD", ({ image }) => {
    copyImageToClipboard(image);
  });

  useTransitionEffect(state, "EDIT", "SAVE_TITLE", (_, { title }) => {
    storage.saveTitle(userId, id, title);
  });

  useTransitionEffect(state, "LOADING", () =>
    storage.fetchExcalidraw(userId, id)
  );

  useTransitionEffect(state, "SYNCING", ({ data }) => {
    storage.saveExcalidraw(userId, id, data);
  });

  useTransitionEffect(state, "DIRTY", () => {
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
