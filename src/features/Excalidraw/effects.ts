import { match, States, useEnterEffect, useMatchEffect } from "react-states";
import { useEnvironment } from "../../environment";

import { ExcalidrawEvent, ExcalidrawContext } from "./types";

export const useClipboardEffect = (excalidraw: ExcalidrawContext) => {
  const { copyImageToClipboard } = useEnvironment();

  useMatchEffect(
    excalidraw,
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
  [excalidraw, send]: States<ExcalidrawContext, ExcalidrawEvent>
) => {
  const { storage } = useEnvironment();

  useEnterEffect(excalidraw, "LOADING", () =>
    storage.fetchExcalidraw(userId, id)
  );

  useEnterEffect(excalidraw, "SYNCING", ({ data }) => {
    storage.saveExcalidraw(userId, id, data);
  });

  useEnterEffect(excalidraw, "DIRTY", () => {
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
