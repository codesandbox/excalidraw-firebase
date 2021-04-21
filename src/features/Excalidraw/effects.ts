import { useEffect } from "react";
import { exec, match, Send, TransitionsReducer } from "react-states";
import { useEnvironment } from "../../environment";

import {
  BaseContext,
  BLUR,
  CONTINUE,
  FOCUS,
  LOADING_ERROR,
  LOADING_SUCCESS,
  REFRESH,
  SYNC,
  SYNC_ERROR,
  SYNC_SUCCESS,
  SUBSCRIPTION_UPDATE,
  ExcalidrawEvent,
  ExcalidrawContext,
} from "./types";

export const useVisibilityChangeEffect = (send: Send<ExcalidrawEvent>) => {
  const { onVisibilityChange } = useEnvironment();

  useEffect(
    () =>
      onVisibilityChange((visible) => {
        if (visible) {
          send({ type: FOCUS });
        } else {
          send({ type: BLUR });
        }
      }),
    []
  );
};

export const useClipboardEffect = (excalidraw: ExcalidrawContext) => {
  const { copyImageToClipboard } = useEnvironment();

  const copyToClipboard = ({ image, clipboard }: BaseContext) =>
    exec(clipboard, {
      COPIED: () => copyImageToClipboard(image),
    });

  useEffect(
    () =>
      exec(excalidraw, {
        DIRTY: copyToClipboard,
        EDIT: copyToClipboard,
        FOCUSED: copyToClipboard,
        SYNCING: copyToClipboard,
        SYNCING_DIRTY: copyToClipboard,
      }),
    []
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
  [excalidraw, send]: TransitionsReducer<ExcalidrawContext, ExcalidrawEvent>
) => {
  const { storage } = useEnvironment();
  const shouldSubscribe = match(excalidraw, {
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
  });

  useEffect(
    () =>
      shouldSubscribe
        ? storage.subscribeToChanges(userId, id, (data) => {
            send({
              type: SUBSCRIPTION_UPDATE,
              data,
            });
          })
        : undefined,
    [shouldSubscribe]
  );
};

export const useStorageEffects = (
  userId: string,
  id: string,
  [excalidraw, send]: TransitionsReducer<ExcalidrawContext, ExcalidrawEvent>
) => {
  const { createExcalidrawImage, storage } = useEnvironment();

  const loadExcalidraw = () =>
    storage.getExcalidraw(userId, id).resolve(
      (response) =>
        createExcalidrawImage(
          response.data.elements,
          response.data.appState
        ).resolve(
          (image) => {
            send({
              type: LOADING_SUCCESS,
              metadata: response.metadata,
              data: response.data,
              image,
            });
          },
          {
            ERROR: (error) => {
              send({
                type: LOADING_ERROR,
                error: error.message,
              });
            },
          }
        ),
      {
        ERROR: (error) => {
          send({
            type: LOADING_ERROR,
            error,
          });
        },
      }
    );

  useEffect(
    () =>
      exec(excalidraw, {
        LOADING: loadExcalidraw,
        UPDATING: loadExcalidraw,
        SYNCING: ({ data }) => {
          // We do not want to cancel this, as the sync should
          // always go through, even moving to a new state
          storage.saveExcalidraw(userId, id, data).resolve(
            (metadata) =>
              createExcalidrawImage(data.elements, data.appState).resolve(
                (image) => {
                  send({
                    type: SYNC_SUCCESS,
                    image,
                    metadata,
                  });

                  return storage
                    .saveImage(userId, id, image)
                    .resolve(() => {}, {
                      ERROR: () => {},
                    });
                },
                {
                  ERROR: () => {
                    send({ type: SYNC_ERROR });
                  },
                }
              ),
            {
              ERROR: () => {
                send({ type: SYNC_ERROR });
              },
            }
          );
        },
        DIRTY: () => {
          const id = setTimeout(() => {
            send({
              type: SYNC,
            });
          }, 500);

          return () => {
            clearTimeout(id);
          };
        },
        FOCUSED: ({ metadata }) =>
          storage
            .hasExcalidrawUpdated(userId, id, metadata.last_updated)
            .resolve(
              (hasUpdated) => {
                if (hasUpdated) {
                  send({ type: REFRESH });
                } else {
                  send({ type: CONTINUE });
                }
              },
              {
                ERROR: () => {
                  send({ type: CONTINUE });
                },
              }
            ),
      }),
    [excalidraw]
  );
};
