import { match, useEnterEffect, useMatchEffect } from "react-states";
import { useEnvironment } from "../../environment";

import { Context, Feature, TransientContext } from "./types";

export const useClipboardEffect = (context: Context | TransientContext) => {
  const { copyImageToClipboard } = useEnvironment();

  useEnterEffect(context, "COPYING_TO_CLIPBOARD", ({ image }) => {
    copyImageToClipboard(image);
  });
};

export const useStorageEffects = (
  userId: string,
  id: string,
  [context, send]: Feature
) => {
  const { storage } = useEnvironment();

  useEnterEffect(context, "LOADING", () => storage.fetchExcalidraw(userId, id));

  useEnterEffect(context, "SYNCING", ({ data }) => {
    storage.saveExcalidraw(userId, id, data);
  });

  useEnterEffect(context, "DIRTY", () => {
    const id = setTimeout(() => {
      send({
        type: "SYNC",
      });
    }, 500);

    return () => {
      clearTimeout(id);
    };
  });
};
