import { useEffect } from "react";
import {
  match,
  Send,
  States,
  useEnterEffect,
  useMatchEffect,
} from "react-states";
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

/*
  - A is at version 0
  - B is at version 0
  - A goes to version 1
  - B receives data from A
  - B is now at version 1 with merged elements of A and B
  - Excalidraw upates scene with merged elements
  - Change event calculates the new version
  - If version has changed (Meaning B also had changes), a new sync occurs. Where A no does the same
  version evaluation and possibly syncs back again, as there were new changes in the meantime
  - If no version changed, we are in sync
*/
export const useSubscriptionEffect = (
  userId: string,
  id: string,
  [excalidraw, send]: States<ExcalidrawContext, ExcalidrawEvent>
) => {
  const { storage } = useEnvironment();

  useMatchEffect(
    excalidraw,
    {
      DIRTY: () => true,
      EDIT: () => true,
      UPDATING_FROM_PEER: () => true,
      SYNCING: () => true,
      SYNCING_DIRTY: () => true,

      UPDATING: () => false,
      UNFOCUSED: () => false,
      ERROR: () => false,
      FOCUSED: () => false,
      LOADED: () => false,
      LOADING: () => false,
    },
    () =>
      storage.subscribeToChanges(userId, id, (data) => {
        send({
          type: "SUBSCRIPTION_UPDATE",
          data,
        });
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

  useEnterEffect(excalidraw, "UPDATING", () =>
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

  useEnterEffect(excalidraw, "FOCUSED", ({ metadata }) =>
    storage.hasExcalidrawUpdated(userId, id, metadata.last_updated).resolve(
      (hasUpdated) => {
        if (hasUpdated) {
          send({ type: "REFRESH" });
        } else {
          send({ type: "CONTINUE" });
        }
      },
      {
        ERROR: () => {
          send({ type: "CONTINUE" });
        },
      }
    )
  );
};
