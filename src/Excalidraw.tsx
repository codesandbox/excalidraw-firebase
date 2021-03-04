import React, { useEffect, useMemo } from "react";
import debounce from "lodash.debounce";
import firebase from "firebase/app";
import { getSceneVersion } from "@excalidraw/excalidraw";
import { PickState, useStates } from "react-states";
import { ExcalidrawCanvas } from "./ExcalidrawCanvas";
import { EXCALIDRAWS_COLLECTION } from "./constants";

type ExcalidrawData = {
  author: string;
  elements: any[];
  appState: any;
};

type Context =
  | {
      state: "LOADING";
    }
  | {
      state: "READONLY";
      data: ExcalidrawData;
    }
  | {
      state: "ERROR";
      error: string;
    }
  | {
      state: "EDIT";
      data: ExcalidrawData;
      version: number;
    }
  | {
      state: "DIRTY";
      data: ExcalidrawData;
      version: number;
    }
  | {
      state: "SYNCING";
      data: ExcalidrawData;
      version: number;
    }
  | {
      state: "SYNCING_DIRTY";
      data: ExcalidrawData;
      version: number;
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
      type: "TOGGLE_READONLY_MODE";
    }
  | {
      type: "CHANGE_DETECTED";
      elements: any[];
      appState: any;
    }
  | {
      type: "SYNC_SUCCESS";
    }
  | {
      type: "SYNC_ERROR";
    };

const createChangeDetectedHandler = <
  C extends Context,
  S extends Context["state"]
>(
  changeContext: (data: ExcalidrawData, version: number) => C
) => (
  { elements, appState }: { elements: any[]; appState: any },
  currentContext: {
    state: S;
    version: number;
    data: ExcalidrawData;
  }
) => {
  const newVersion = getSceneVersion(elements);

  if (
    currentContext.version !== newVersion ||
    currentContext.data.appState.viewBackgroundColor !==
      appState.viewBackgroundColor
  ) {
    return changeContext(
      { ...currentContext.data, elements, appState },
      newVersion
    );
  }

  return currentContext;
};

export const Excalidraw = ({ id }: { id: string }) => {
  const excalidraw = useStates<Context, Action>(
    {
      LOADING: {
        LOADING_SUCCESS: ({ data }) =>
          window.parent === window
            ? {
                state: "EDIT",
                data,
                version: getSceneVersion(data.elements),
              }
            : {
                state: "READONLY",
                data,
              },
        LOADING_ERROR: ({ error }) => ({ state: "ERROR", error }),
      },
      READONLY: {
        TOGGLE_READONLY_MODE: (_, currentContext) => ({
          ...currentContext,
          state: "EDIT",
          version: getSceneVersion(currentContext.data.elements),
        }),
        SNAPSHOT: ({ data }) => ({
          state: "READONLY",
          data,
        }),
      },
      EDIT: {
        TOGGLE_READONLY_MODE: (_, currentContext) => ({
          ...currentContext,
          state: "READONLY",
        }),
        CHANGE_DETECTED: createChangeDetectedHandler((data, version) => ({
          state: "DIRTY",
          data,
          version,
        })),
      },
      DIRTY: {
        SYNC: (_, { data, version }) => ({
          state: "SYNCING",
          data: data,
          version,
        }),
        CHANGE_DETECTED: createChangeDetectedHandler((data, version) => ({
          state: "DIRTY",
          data,
          version,
        })),
      },
      SYNCING: {
        CHANGE_DETECTED: createChangeDetectedHandler((data, version) => ({
          state: "SYNCING_DIRTY",
          data,
          version,
        })),
        SYNC_SUCCESS: (_, { data, version }) => ({
          state: "EDIT",
          data,
          version,
        }),
        SYNC_ERROR: (_) => ({ state: "ERROR", error: "Unable to sync" }),
      },
      SYNCING_DIRTY: {
        CHANGE_DETECTED: createChangeDetectedHandler((data, version) => ({
          state: "SYNCING_DIRTY",
          data,
          version,
        })),
        SYNC_SUCCESS: (_, { data, version }) => ({
          state: "DIRTY",
          data,
          version,
        }),
        SYNC_ERROR: (_, { data, version }) => ({
          state: "DIRTY",
          data,
          version,
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
            .collection(EXCALIDRAWS_COLLECTION)
            .doc(id)
            .set(
              {
                elements: JSON.stringify(data.elements),
                appState: JSON.stringify(data.appState),
              },
              {
                merge: true,
              }
            )
            .then(() => {
              excalidraw.dispatch({ type: "SYNC_SUCCESS" });
            })
            .catch(() => {
              excalidraw.dispatch({ type: "SYNC_ERROR" });
            });
        },
        READONLY: () => {
          let ignoredInitial = false;
          return firebase
            .firestore()
            .collection(EXCALIDRAWS_COLLECTION)
            .doc(id)
            .onSnapshot((snapshot) => {
              if (!ignoredInitial) {
                ignoredInitial = true;
                return;
              }
              excalidraw.dispatch({
                type: "SNAPSHOT",
                data: snapshot.data() as ExcalidrawData,
              });
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
      }),
    [excalidraw]
  );

  const onChange = useMemo(
    () =>
      debounce((elements, appState) => {
        excalidraw.dispatch({
          type: "CHANGE_DETECTED",
          elements,
          appState: { viewBackgroundColor: appState.viewBackgroundColor },
        });
      }, 100),
    []
  );

  const renderExcalidraw = ({
    data,
    state,
  }: PickState<
    Context,
    "READONLY" | "EDIT" | "SYNCING" | "DIRTY" | "SYNCING_DIRTY"
  >) => (
    <div>
      <ExcalidrawCanvas
        key={id}
        data={data}
        onChange={onChange}
        readOnly={state === "READONLY"}
      />
      {state === "DIRTY" || state === "SYNCING" || state === "SYNCING_DIRTY" ? (
        <div className="lds-dual-ring"></div>
      ) : (
        <button
          className="edit"
          onClick={() => excalidraw.dispatch({ type: "TOGGLE_READONLY_MODE" })}
        >
          {state === "READONLY" ? "edit" : "view"}
        </button>
      )}
    </div>
  );

  return excalidraw.transform({
    LOADING: () => <div className="center-wrapper">Loading...</div>,
    ERROR: ({ error }) => (
      <div className="center-wrapper">OMG, error, {error}</div>
    ),
    EDIT: renderExcalidraw,
    READONLY: renderExcalidraw,
    SYNCING: renderExcalidraw,
    DIRTY: renderExcalidraw,
    SYNCING_DIRTY: renderExcalidraw,
  });
};
