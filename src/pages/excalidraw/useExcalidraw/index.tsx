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

  useTransitionEffect(state, "EDIT", "EDIT", ({ image }, action) => {
    if (action.type === "COPY_TO_CLIPBOARD") {
      copyImageToClipboard(image);
    }
    if (action.type === "SAVE_TITLE") {
      storage.saveTitle(userId, id, action.title);
    }
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
