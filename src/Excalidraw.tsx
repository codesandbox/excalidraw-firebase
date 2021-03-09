import React, { useEffect, useMemo } from "react";
import debounce from "lodash.debounce";
import firebase from "firebase/app";
import { getSceneVersion } from "@excalidraw/excalidraw";
import { PickState, useStates } from "react-states";
import { ExcalidrawCanvas } from "./ExcalidrawCanvas";
import {
  EXCALIDRAWS_COLLECTION,
  EXCALIDRAW_PREVIEWS_COLLECTION,
  USERS_COLLECTION,
} from "./constants";
import { blobToBase64, createExcalidrawImage } from "./utils";

type ExcalidrawData = {
  author: string;
  elements: any[];
  appState: any;
  version: number;
};

type Context =
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
    }
  | {
      state: "EDIT";
      data: ExcalidrawData;
      image: Blob;
    }
  | {
      state: "EDIT_CLIPBOARD";
      data: ExcalidrawData;
      image: Blob;
    }
  | {
      state: "DIRTY";
      data: ExcalidrawData;
    }
  | {
      state: "SYNCING";
      data: ExcalidrawData;
    }
  | {
      state: "SYNCING_DIRTY";
      data: ExcalidrawData;
    };

type Action =
  | {
      type: "LOADING_SUCCESS";
      data: ExcalidrawData;
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

export const Excalidraw = ({ id, userId }: { id: string; userId: string }) => {
  const excalidraw = useStates<Context, Action>(
    {
      LOADING: {
        LOADING_SUCCESS: ({ data }) => ({
          state: "LOADED",
          data,
        }),
        LOADING_ERROR: ({ error }) => ({ state: "ERROR", error }),
      },
      LOADED: {
        INITIALIZED: ({ image }, { data }) => ({
          state: "EDIT",
          data,
          image,
        }),
      },
      EDIT: {
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                state: "DIRTY",
                data: {
                  ...newData,
                  author: currentContext.data.author,
                },
              }
            : currentContext,
        COPY_TO_CLIPBOARD: (_, { data, image }) => ({
          state: "EDIT_CLIPBOARD",
          data,
          image,
        }),
      },
      EDIT_CLIPBOARD: {
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                state: "DIRTY",
                data: {
                  ...newData,
                  author: currentContext.data.author,
                },
              }
            : currentContext,
      },
      DIRTY: {
        SYNC: (_, { data }) => ({
          state: "SYNCING",
          data: data,
        }),
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                state: "DIRTY",
                data: {
                  ...newData,
                  author: currentContext.data.author,
                },
              }
            : currentContext,
      },
      SYNCING: {
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                state: "SYNCING_DIRTY",
                data: {
                  ...newData,
                  author: currentContext.data.author,
                },
              }
            : currentContext,
        SYNC_SUCCESS: ({ image }, { data }) => ({
          state: "EDIT",
          data,
          image,
        }),
        SYNC_ERROR: (_) => ({ state: "ERROR", error: "Unable to sync" }),
      },
      SYNCING_DIRTY: {
        CHANGE_DETECTED: (newData, currentContext) =>
          hasChangedExcalidraw(currentContext.data, newData)
            ? {
                state: "SYNCING_DIRTY",
                data: {
                  ...newData,
                  author: currentContext.data.author,
                },
              }
            : currentContext,
        SYNC_SUCCESS: (_, { data }) => ({
          state: "DIRTY",
          data,
        }),
        SYNC_ERROR: (_, { data }) => ({
          state: "DIRTY",
          data,
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
          firebase
            .firestore()
            .collection(USERS_COLLECTION)
            .doc(userId)
            .collection(EXCALIDRAWS_COLLECTION)
            .doc(id)
            .get()
            .then((doc) => {
              const data = doc.data();

              if (data) {
                excalidraw.dispatch({
                  type: "LOADING_SUCCESS",
                  data: {
                    author: data.author,
                    appState: JSON.parse(data.appState),
                    elements: JSON.parse(data.elements),
                  } as ExcalidrawData,
                });
              } else {
                excalidraw.dispatch({
                  type: "LOADING_ERROR",
                  error: "Found the excalidraw without any content, wtf?",
                });
              }
            })
            .catch((error) => {
              excalidraw.dispatch({
                type: "LOADING_ERROR",
                error: error.message,
              });
            });
        },
        SYNCING: ({ data }) => {
          firebase
            .firestore()
            .collection(USERS_COLLECTION)
            .doc(userId)
            .collection(EXCALIDRAWS_COLLECTION)
            .doc(id)
            .set(
              {
                elements: JSON.stringify(data.elements),
                appState: JSON.stringify({
                  viewBackgroundColor: data.appState.viewBackgroundColor,
                }),
                last_updated: firebase.firestore.FieldValue.serverTimestamp(),
              },
              {
                merge: true,
              }
            )
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
                blobToBase64(image).then((src) => {
                  firebase
                    .firestore()
                    .collection(USERS_COLLECTION)
                    .doc(userId)
                    .collection(EXCALIDRAW_PREVIEWS_COLLECTION)
                    .doc(id)
                    .set({
                      src,
                    });
                });
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

  const onChange = useMemo(
    () =>
      debounce((elements, appState) => {
        excalidraw.dispatch({
          type: "CHANGE_DETECTED",
          elements,
          appState,
          version: getSceneVersion(elements),
        });
      }, 100),
    []
  );

  const renderExcalidraw = (
    context: PickState<
      Context,
      | "LOADED"
      | "EDIT"
      | "EDIT_CLIPBOARD"
      | "SYNCING"
      | "DIRTY"
      | "SYNCING_DIRTY"
    >
  ) => (
    <div>
      <ExcalidrawCanvas
        key={id}
        data={context.data}
        onChange={onChange}
        onInitialized={() => {
          createExcalidrawImage(
            context.data.elements,
            context.data.appState
          ).then((image) => {
            excalidraw.dispatch({ type: "INITIALIZED", image });
          });
        }}
      />
      <div
        className="edit"
        style={excalidraw.transform({
          EDIT_CLIPBOARD: () => ({
            backgroundColor: "yellowgreen",
            color: "darkgreen",
          }),
          DIRTY: () => ({
            opacity: 0.5,
          }),
          SYNCING: () => ({
            opacity: 0.5,
          }),
          SYNCING_DIRTY: () => ({
            opacity: 0.5,
          }),
          EDIT: () => undefined,
          ERROR: () => undefined,
          LOADED: () => undefined,
          LOADING: () => undefined,
        })}
        onClick={() => {
          excalidraw.dispatch({ type: "COPY_TO_CLIPBOARD" });
        }}
      >
        {excalidraw.transform({
          SYNCING: () => <div className="lds-dual-ring"></div>,
          SYNCING_DIRTY: () => <div className="lds-dual-ring"></div>,
          DIRTY: () => <div className="lds-dual-ring"></div>,
          EDIT: () => "Copy to clipboard",
          EDIT_CLIPBOARD: () => "Copied!",
          ERROR: () => null,
          LOADED: () => null,
          LOADING: () => null,
        })}
      </div>
    </div>
  );

  return excalidraw.transform({
    LOADING: () => <div className="center-wrapper">Loading...</div>,
    ERROR: ({ error }) => (
      <div className="center-wrapper">OMG, error, {error}</div>
    ),
    LOADED: renderExcalidraw,
    EDIT: renderExcalidraw,
    EDIT_CLIPBOARD: renderExcalidraw,
    SYNCING: renderExcalidraw,
    DIRTY: renderExcalidraw,
    SYNCING_DIRTY: renderExcalidraw,
  });
};
