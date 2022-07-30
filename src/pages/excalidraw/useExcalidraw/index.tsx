import { Dispatch, useEffect, useReducer } from "react";

import { reducer } from "./reducer";
import { ExcalidrawAction, ExcalidrawState } from "./types";

import { useEnvironment } from "../../../environment-interface";
import { useStateTransition, useDevtools } from "react-states";

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

  useStateTransition(
    state,
    {
      EDIT: {
        COPY_TO_CLIPBOARD: "EDIT",
      },
    },
    ({ image }) => {
      copyImageToClipboard(image);
    }
  );

  useStateTransition(
    state,
    {
      EDIT: {
        SAVE_TITLE: "EDIT",
      },
    },
    (_, { title }) => {
      storage.saveTitle(userId, id, title);
    }
  );

  useStateTransition(state, "LOADING", () =>
    storage.fetchExcalidraw(userId, id)
  );

  useStateTransition(state, "SYNCING", ({ data }) => {
    storage.saveExcalidraw(userId, id, data);
  });

  useStateTransition(state, "DIRTY", () => {
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
