import React, { useEffect } from "react";
import firebase from "firebase/app";
import { States, useStates } from "react-states";
import {
  EXCALIDRAWS_COLLECTION,
  EXCALIDRAWS_DATA_COLLECTION,
  USERS_COLLECTION,
} from "../constants";
import { createExcalidrawImage } from "../utils";
import { ExcalidrawData, ExcalidrawMetaData } from "../types";

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
      metadata: ExcalidrawMetaData;
    }
  | {
      state: "EDIT";
      data: ExcalidrawData;
      metadata: ExcalidrawMetaData;
      image: Blob;
    }
  | {
      state: "EDIT_CLIPBOARD";
      data: ExcalidrawData;
      metadata: ExcalidrawMetaData;
      image: Blob;
    }
  | {
      state: "DIRTY";
      data: ExcalidrawData;
      metadata: ExcalidrawMetaData;
    }
  | {
      state: "SYNCING";
      data: ExcalidrawData;
      metadata: ExcalidrawMetaData;
    }
  | {
      state: "SYNCING_DIRTY";
      data: ExcalidrawData;
      metadata: ExcalidrawMetaData;
    };

export type Action =
  | {
      type: "LOADING_SUCCESS";
      data: ExcalidrawData;
      metadata: ExcalidrawMetaData;
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
      type: "INITIALIZED";
      image: Blob;
    }
  | {
      type: "COPY_TO_CLIPBOARD";
    };

const hasChangedExcalidraw = (
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
) => {
  return (
    oldData.version !== newData.version ||
    oldData.appState.viewBackgroundColor !==
      newData.appState.viewBackgroundColor
  );
};

const context = React.createContext({} as States<Context, Action>);

export const useExcalidraw = () => React.useContext(context);

export const ExcalidrawProvider = ({
  id,
  userId,
  children,
}: {
  id: string;
  userId: string;
  children: React.ReactNode;
}) => {
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
        INITIALIZED: ({ image }, { data, metadata }) => ({
          state: "EDIT",
          data,
          metadata,
          image,
        }),
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

  useEffect(
    () =>
      excalidraw.exec({
        LOADING: () => {
          Promise.all([
            firebase
              .firestore()
              .collection(USERS_COLLECTION)
              .doc(userId)
              .collection(EXCALIDRAWS_COLLECTION)
              .doc(id)
              .get(),
            firebase
              .firestore()
              .collection(USERS_COLLECTION)
              .doc(userId)
              .collection(EXCALIDRAWS_DATA_COLLECTION)
              .doc(id)
              .get(),
          ])
            .then(([metadataDoc, dataDoc]) => {
              const metadata = metadataDoc.data() as ExcalidrawMetaData;
              const data = (dataDoc.exists
                ? dataDoc.data()
                : {
                    elements: JSON.stringify([]),
                    appState: JSON.stringify({
                      viewBackgroundColor: "#FFF",
                      currentItemFontFamily: 1,
                    }),
                  }) as {
                elements: string;
                appState: string;
              };

              excalidraw.dispatch({
                type: "LOADING_SUCCESS",
                metadata,
                data: {
                  appState: JSON.parse(data.appState),
                  elements: JSON.parse(data.elements),
                } as ExcalidrawData,
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
          Promise.all([
            firebase
              .firestore()
              .collection(USERS_COLLECTION)
              .doc(userId)
              .collection(EXCALIDRAWS_DATA_COLLECTION)
              .doc(id)
              .set({
                elements: JSON.stringify(data.elements),
                appState: JSON.stringify({
                  viewBackgroundColor: data.appState.viewBackgroundColor,
                }),
              }),
            firebase
              .firestore()
              .collection(USERS_COLLECTION)
              .doc(userId)
              .collection(EXCALIDRAWS_COLLECTION)
              .doc(id)
              .set(
                {
                  last_updated: firebase.firestore.FieldValue.serverTimestamp(),
                },
                {
                  merge: true,
                }
              ),
          ])
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
                firebase
                  .storage()
                  .ref()
                  .child(`previews/${userId}/${id}`)
                  .put(image);
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
