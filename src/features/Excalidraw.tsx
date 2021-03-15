import React, { useEffect } from "react";
import { States, useStates } from "react-states";
import { ExcalidrawData, ExcalidrawMetadata } from "../types";
import { useEnvironment } from "../environment";
import { useDevtools } from "react-states/devtools";

export type Context =
  | {
      state: "LOADING";
    }
  | {
      state: "ERROR";
      error: string;
    }
  | {
      state: "LOADED";
      data: ExcalidrawData;
      metadata: ExcalidrawMetadata;
    }
  | {
      state: "REOPENED";
    }
  | {
      state: "EDIT";
      data: ExcalidrawData;
      metadata: ExcalidrawMetadata;
      image: Blob;
    }
  | {
      state: "EDIT_CLIPBOARD";
      data: ExcalidrawData;
      metadata: ExcalidrawMetadata;
      image: Blob;
    }
  | {
      state: "DIRTY";
      data: ExcalidrawData;
      metadata: ExcalidrawMetadata;
    }
  | {
      state: "SYNCING";
      data: ExcalidrawData;
      metadata: ExcalidrawMetadata;
    }
  | {
      state: "SYNCING_DIRTY";
      data: ExcalidrawData;
      metadata: ExcalidrawMetadata;
    };

export type Action =
  | {
      type: "REOPEN";
    }
  | {
      type: "LOADING_SUCCESS";
      data: ExcalidrawData;
      metadata: ExcalidrawMetadata;
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
    }
  | {
      type: "SYNC_ERROR";
    }
  | {
      type: "INITIALIZE_CANVAS_SUCCESS";
      image: Blob;
    }
  | {
      type: "COPY_TO_CLIPBOARD";
    };

export const ExcalidrawProvider = ({
  id,
  userId,
  children,
}: {
  id: string;
  userId: string;
  children: React.ReactNode;
}) => {
  const { createExcalidrawImage, storage } = useEnvironment();
  const excalidraw = useStates<Context, Action>(
    {
      LOADING: {
        LOADING_SUCCESS: ({ data, metadata }) => ({
          state: "LOADED",
          data,
          metadata,
        }),
        LOADING_ERROR: ({ error }) => ({ state: "ERROR", error }),
      },
      LOADED: {
        INITIALIZE_CANVAS_SUCCESS: ({ image }, { data, metadata }) => ({
          state: "EDIT",
          data,
          metadata,
          image,
        }),
      },
      REOPENED: {
        LOADING_SUCCESS: ({ data, metadata }) => ({
          state: "LOADED",
          data,
          metadata,
        }),
        LOADING_ERROR: ({ error }) => ({ state: "ERROR", error }),
      },
      EDIT: {
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                state: "DIRTY",
                data: newData,
                metadata: currentContext.metadata,
              }
            : currentContext,
        COPY_TO_CLIPBOARD: (_, { data, image, metadata }) => ({
          state: "EDIT_CLIPBOARD",
          data,
          metadata,
          image,
        }),
        REOPEN: () => ({ state: "REOPENED" }),
      },
      EDIT_CLIPBOARD: {
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                state: "DIRTY",
                data: newData,
                metadata: currentContext.metadata,
              }
            : currentContext,
        REOPEN: () => ({ state: "REOPENED" }),
      },
      DIRTY: {
        SYNC: (_, { data, metadata }) => ({
          state: "SYNCING",
          data: data,
          metadata,
        }),
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                state: "DIRTY",
                data: newData,
                metadata: currentContext.metadata,
              }
            : currentContext,
      },
      SYNCING: {
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                state: "SYNCING_DIRTY",
                data: newData,
                metadata: currentContext.metadata,
              }
            : currentContext,
        SYNC_SUCCESS: ({ image }, { data, metadata }) => ({
          state: "EDIT",
          data,
          metadata,
          image,
        }),
        SYNC_ERROR: (_) => ({ state: "ERROR", error: "Unable to sync" }),
      },
      SYNCING_DIRTY: {
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                state: "SYNCING_DIRTY",
                data: newData,
                metadata: currentContext.metadata,
              }
            : currentContext,
        SYNC_SUCCESS: (_, { data, metadata }) => ({
          state: "DIRTY",
          data,
          metadata,
        }),
        SYNC_ERROR: (_, { data, metadata }) => ({
          state: "DIRTY",
          data,
          metadata,
        }),
      },
      ERROR: {},
    },
    {
      state: "LOADING",
    }
  );

  if (process.env.NODE_ENV === "development") {
    useDevtools("excalidraw", excalidraw);
  }

  useEffect(
    () =>
      excalidraw.exec({
        LOADING: () => {
          storage
            .getExcalidraw(userId, id)
            .then((response) => {
              excalidraw.dispatch({
                type: "LOADING_SUCCESS",
                metadata: response.metadata,
                data: response.data,
              });
            })
            .catch((error) => {
              excalidraw.dispatch({
                type: "LOADING_ERROR",
                error: error.message,
              });
            });
        },
        SYNCING: ({ data }) => {
          storage
            .saveExcalidraw(userId, id, data.elements, data.appState)
            .then(() => {
              return createExcalidrawImage(data.elements, data.appState);
            })
            .then((image) => {
              excalidraw.dispatch({ type: "SYNC_SUCCESS", image });
              return image;
            })
            .catch(() => {
              excalidraw.dispatch({ type: "SYNC_ERROR" });
            })
            .then((image) => {
              if (image) {
                storage.saveImage(userId, id, image);
              }
            });
        },
        DIRTY: () => {
          const id = setTimeout(() => {
            excalidraw.dispatch({
              type: "SYNC",
            });
          }, 1000);

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
      }),
    [excalidraw]
  );

  return <context.Provider value={excalidraw}>{children}</context.Provider>;
};

const context = React.createContext({} as States<Context, Action>);

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
