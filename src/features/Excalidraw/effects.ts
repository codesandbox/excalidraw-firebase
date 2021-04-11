import { useEffect } from "react";
import { exec, StatesReducer } from "react-states";
import { useEnvironment } from "../../environment";

import {
  BaseContext,
  ExcalidrawAction,
  ExcalidrawContext,
  BLUR,
  CONTINUE,
  FOCUS,
  LOADING_ERROR,
  LOADING_SUCCESS,
  REFRESH,
  SYNC,
  SYNC_ERROR,
  SYNC_SUCCESS,
  ExcalidrawReducer,
} from "./types";

export const useVisibilityChangeEffect = ([_, dispatch]: ExcalidrawReducer) => {
  const { onVisibilityChange } = useEnvironment();

  useEffect(
    () =>
      onVisibilityChange((visible) => {
        if (visible) {
          dispatch({ type: FOCUS });
        } else {
          dispatch({ type: BLUR });
        }
      }),
    []
  );
};

export const useClipboardEffect = ([excalidraw]: ExcalidrawReducer) => {
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

export const useStorageEffects = (
  userId: string,
  id: string,
  [excalidraw, dispatch]: ExcalidrawReducer
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
            dispatch({
              type: LOADING_SUCCESS,
              metadata: response.metadata,
              data: response.data,
              image,
            });
          },
          {
            ERROR: (error) => {
              dispatch({
                type: LOADING_ERROR,
                error: error.message,
              });
            },
          }
        ),
      {
        ERROR: (error) => {
          dispatch({
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
          storage
            .saveExcalidraw(userId, id, data.elements, data.appState)
            .resolve(
              (metadata) =>
                createExcalidrawImage(data.elements, data.appState).resolve(
                  (image) => {
                    dispatch({
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
                      dispatch({ type: SYNC_ERROR });
                    },
                  }
                ),
              {
                ERROR: () => {
                  dispatch({ type: SYNC_ERROR });
                },
              }
            );
        },
        DIRTY: () => {
          const id = setTimeout(() => {
            dispatch({
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
                  dispatch({ type: REFRESH });
                } else {
                  dispatch({ type: CONTINUE });
                }
              },
              {
                ERROR: () => {
                  dispatch({ type: CONTINUE });
                },
              }
            ),
      }),
    [excalidraw]
  );
};
