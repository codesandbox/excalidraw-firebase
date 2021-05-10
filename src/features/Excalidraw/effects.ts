import { match, useEnterEffect, useMatchEffect } from "react-states";
import { useEnvironment } from "../../environment";

import { Context, Feature } from "./types";

export const useClipboardEffect = (context: Context) => {
  const { copyImageToClipboard } = useEnvironment();

  useMatchEffect(
    context,
    {
      DIRTY: () => true,
      EDIT: () => true,
      FOCUSED: () => true,
      SYNCING: () => true,
      SYNCING_DIRTY: () => true,

      ERROR: () => false,
      LOADED: () => false,
      LOADING: () => false,
      UNFOCUSED: () => false,
      UPDATING: () => false,
      UPDATING_FROM_PEER: () => false,
    },
    ({ image, clipboard }) =>
      match(clipboard, {
        COPIED: () => {
          copyImageToClipboard(image);
        },
        NOT_COPIED: () => {},
      })
  );
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
