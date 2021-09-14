import { useCommandEffect, useStateEffect } from "react-states";
import { useEnvironment } from "../../environment";

import { Feature } from "./types";

export const useClipboardEffect = ([state]: Feature) => {
  const { copyImageToClipboard } = useEnvironment();

  useCommandEffect(state, "COPY_TO_CLIPBOARD", ({ image }) => {
    copyImageToClipboard(image);
  });
};

export const useStorageEffects = (
  userId: string,
  id: string,
  [state, dispatch]: Feature
) => {
  const { storage } = useEnvironment();

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
};
