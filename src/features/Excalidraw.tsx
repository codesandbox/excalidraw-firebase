import React, { useEffect } from "react";
import { States, useStates } from "react-states";
import { ExcalidrawData, ExcalidrawMetadata } from "../environment/storage";
import { useEnvironment } from "../environment";
import { useDevtools } from "react-states/devtools";

export type BaseContext = {
  data: ExcalidrawData;
  metadata: ExcalidrawMetadata;
  image: Blob;
};

export type ExcalidrawContext =
  | {
      state: "LOADING";
    }
  | {
      state: "ERROR";
      error: string;
    }
  | (BaseContext &
      (
        | {
            state: "LOADED";
          }
        | {
            state: "EDIT";
          }
        | {
            state: "EDIT_CLIPBOARD";
          }
        | {
            state: "DIRTY";
          }
        | {
            state: "SYNCING";
          }
        | {
            state: "SYNCING_DIRTY";
          }
        | {
            state: "UNFOCUSED";
          }
        | {
            state: "FOCUSED";
          }
        | {
            state: "UPDATING";
          }
      ));

export type ExcalidrawAction =
  | {
      type: "LOADING_SUCCESS";
      data: ExcalidrawData;
      metadata: ExcalidrawMetadata;
      image: Blob;
    }
  | {
      type: "LOADING_ERROR";
      error: string;
    }
  | {
      type: "SYNC";
    }
  | {
      type: "SNAPSHOT";
      data: ExcalidrawData;
    }
  | {
      type: "SYNC_ERROR";
      error: string;
    }
  | {
      type: "CHANGE_DETECTED";
      elements: any[];
      appState: any;
      version: number;
    }
  | {
      type: "SYNC_SUCCESS";
      image: Blob;
      metadata: ExcalidrawMetadata;
    }
  | {
      type: "SYNC_ERROR";
    }
  | {
      type: "INITIALIZE_CANVAS_SUCCESS";
    }
  | {
      type: "COPY_TO_CLIPBOARD";
    }
  | {
      type: "FOCUS";
    }
  | {
      type: "BLUR";
    }
  /**
   *  When user focuses tab with a dirty change, go grab latest
   * from storage
   */
  | {
      type: "REFRESH";
    }
  /**
   * When user focuses tab with a dirty change, continue
   * with client version
   */
  | {
      type: "CONTINUE";
    };

export const ExcalidrawProvider = ({
  id,
  userId,
  children,
  initialContext = {
    state: "LOADING",
  },
}: {
  id: string;
  userId: string;
  children: React.ReactNode;
  initialContext?: ExcalidrawContext;
}) => {
  const {
    createExcalidrawImage,
    storage,
    onVisibilityChange,
  } = useEnvironment();
  const excalidraw = useStates<ExcalidrawContext, ExcalidrawAction>(
    {
      LOADING: {
        LOADING_SUCCESS: ({ data, metadata, image }) => ({
          state: "LOADED",
          data,
          metadata,
          image,
        }),
        LOADING_ERROR: ({ error }) => ({ state: "ERROR", error }),
      },
      LOADED: {
        INITIALIZE_CANVAS_SUCCESS: (_, currentContext) => ({
          ...currentContext,
          state: "EDIT",
        }),
      },
      EDIT: {
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                ...currentContext,
                state: "DIRTY",
                data: newData,
              }
            : currentContext,
        COPY_TO_CLIPBOARD: (_, currentContext) => ({
          ...currentContext,
          state: "EDIT_CLIPBOARD",
        }),
        BLUR: (_, currentContext) => ({
          ...currentContext,
          state: "UNFOCUSED",
        }),
      },
      EDIT_CLIPBOARD: {
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                ...currentContext,
                state: "DIRTY",
              }
            : currentContext,
      },
      DIRTY: {
        SYNC: (_, currentContext) => ({
          ...currentContext,
          state: "SYNCING",
        }),
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                ...currentContext,
                state: "DIRTY",
                data: newData,
              }
            : currentContext,
        BLUR: (_, currentContext) => ({
          ...currentContext,
          state: "UNFOCUSED",
        }),
      },
      SYNCING: {
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                ...currentContext,
                state: "SYNCING_DIRTY",
                data: newData,
              }
            : currentContext,
        SYNC_SUCCESS: ({ image, metadata }, currentContext) => ({
          ...currentContext,
          state: "EDIT",
          metadata,
          image,
        }),
        SYNC_ERROR: (_) => ({ state: "ERROR", error: "Unable to sync" }),
        BLUR: (_, currentContext) => ({
          ...currentContext,
          state: "UNFOCUSED",
        }),
      },
      SYNCING_DIRTY: {
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                ...currentContext,
                state: "SYNCING_DIRTY",
                data: newData,
              }
            : currentContext,
        SYNC_SUCCESS: (_, currentContext) => ({
          ...currentContext,
          state: "DIRTY",
        }),
        SYNC_ERROR: (_, currentContext) => ({
          ...currentContext,
          state: "DIRTY",
        }),
        BLUR: (_, currentContext) => ({
          ...currentContext,
          state: "UNFOCUSED",
        }),
      },
      ERROR: {},
      UNFOCUSED: {
        FOCUS: (_, currentContext) => ({
          ...currentContext,
          state: "FOCUSED",
        }),
      },
      FOCUSED: {
        REFRESH: (_, currentContext) => ({
          ...currentContext,
          state: "UPDATING",
        }),
        CONTINUE: (_, currentContext) => ({
          ...currentContext,
          state: "EDIT",
        }),
      },
      UPDATING: {
        LOADING_SUCCESS: ({ data, metadata, image }) => ({
          state: "EDIT",
          data,
          metadata,
          image,
        }),
        LOADING_ERROR: ({ error }) => ({ state: "ERROR", error }),
      },
    },
    initialContext
  );

  if (process.env.NODE_ENV === "development") {
    useDevtools("excalidraw", excalidraw);
  }

  useEffect(
    () =>
      onVisibilityChange((visible) => {
        if (visible) {
          excalidraw.dispatch({ type: "FOCUS" });
        } else {
          excalidraw.dispatch({ type: "BLUR" });
        }
      }),
    []
  );

  const loadExcalidraw = () =>
    storage.getExcalidraw(userId, id).resolve(
      (response) =>
        createExcalidrawImage(
          response.data.elements,
          response.data.appState
        ).resolve(
          (image) => {
            excalidraw.dispatch({
              type: "LOADING_SUCCESS",
              metadata: response.metadata,
              data: response.data,
              image,
            });
          },
          {
            ERROR: (error) => {
              excalidraw.dispatch({
                type: "LOADING_ERROR",
                error: error.message,
              });
            },
          }
        ),
      {
        ERROR: (error) => {
          excalidraw.dispatch({
            type: "LOADING_ERROR",
            error,
          });
        },
      }
    );

  useEffect(
    () =>
      excalidraw.exec({
        LOADING: loadExcalidraw,
        SYNCING: ({ data }) =>
          storage
            .saveExcalidraw(userId, id, data.elements, data.appState)
            .resolve(
              (metadata) =>
                createExcalidrawImage(data.elements, data.appState).resolve(
                  (image) => {
                    excalidraw.dispatch({
                      type: "SYNC_SUCCESS",
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
                      excalidraw.dispatch({ type: "SYNC_ERROR" });
                    },
                  }
                ),
              {
                ERROR: () => {
                  excalidraw.dispatch({ type: "SYNC_ERROR" });
                },
              }
            ),
        DIRTY: () => {
          const id = setTimeout(() => {
            excalidraw.dispatch({
              type: "SYNC",
            });
          }, 500);

          return () => {
            clearTimeout(id);
          };
        },
        EDIT_CLIPBOARD: ({ image }) => {
          // @ts-ignore
          navigator.clipboard.write([
            // @ts-ignore
            new window.ClipboardItem({ "image/png": image }),
          ]);
        },
        FOCUSED: ({ metadata }) =>
          storage
            .hasExcalidrawUpdated(userId, id, metadata.last_updated)
            .resolve(
              (hasUpdated) => {
                if (hasUpdated) {
                  excalidraw.dispatch({ type: "REFRESH" });
                } else {
                  excalidraw.dispatch({ type: "CONTINUE" });
                }
              },
              {
                ERROR: () => {
                  excalidraw.dispatch({ type: "CONTINUE" });
                },
              }
            ),
        UPDATING: loadExcalidraw,
      }),
    [excalidraw]
  );

  return <context.Provider value={excalidraw}>{children}</context.Provider>;
};

const context = React.createContext(
  {} as States<ExcalidrawContext, ExcalidrawAction>
);

export const useExcalidraw = () => React.useContext(context);

function hasChangedExcalidraw(
  oldData: {
    elements: any[];
    appState: any;
    version: number;
  },
  newData: {
    elements: any[];
    appState: any;
    version: number;
  }
) {
  return (
    oldData.version !== newData.version ||
    oldData.appState.viewBackgroundColor !==
      newData.appState.viewBackgroundColor
  );
}
