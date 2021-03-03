import React, { useCallback, useEffect, useMemo, useReducer } from "react";
import debounce from "lodash.debounce";
import firebase from "firebase/app";
import {
  exec,
  PickAction,
  PickState,
  transform,
  transition,
} from "react-states";
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

export const Excalidraw = ({ id }: { id: string }) => {
  const [context, dispatch] = useReducer(
    (context: Context, action: Action) =>
      transition(context, action, {
        LOADING: {
          LOADING_SUCCESS: ({ data }) =>
            window.parent === window
              ? {
                  state: "EDIT",
                  data,
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
          CHANGE_DETECTED: ({ elements, appState }, { data }) => ({
            state: "DIRTY",
            data: {
              ...data,
              elements,
              appState,
            },
          }),
        },
        DIRTY: {
          SYNC: (_, { data }) => ({
            state: "SYNCING",
            data: data,
          }),
          CHANGE_DETECTED: ({ elements, appState }, { data }) => ({
            state: "DIRTY",
            data: {
              ...data,
              elements,
              appState,
            },
          }),
        },
        SYNCING: {
          CHANGE_DETECTED: ({ elements, appState }, { data }) => ({
            state: "SYNCING_DIRTY",
            data: {
              ...data,
              elements,
              appState,
            },
          }),
          SYNC_SUCCESS: (_, { data }) => ({ state: "EDIT", data }),
          SYNC_ERROR: (_) => ({ state: "ERROR", error: "Unable to sync" }),
        },
        SYNCING_DIRTY: {
          CHANGE_DETECTED: ({ elements, appState }, { data }) => ({
            state: "SYNCING_DIRTY",
            data: {
              ...data,
              elements,
              appState,
            },
          }),
          SYNC_SUCCESS: (_, { data }) => ({ state: "DIRTY", data }),
          SYNC_ERROR: (_, { data }) => ({ state: "DIRTY", data }),
        },
        ERROR: {},
      }),
    {
      state: "LOADING",
    }
  );

  useEffect(
    () =>
      exec(context, {
        LOADING: () => {
          firebase
            .firestore()
            .collection(EXCALIDRAWS_COLLECTION)
            .doc(id)
            .get()
            .then((doc) => {
              const data = doc.data();

              if (data) {
                dispatch({
                  type: "LOADING_SUCCESS",
                  data: {
                    author: data.author,
                    appState: JSON.parse(data.appState),
                    elements: JSON.parse(data.elements),
                  } as ExcalidrawData,
                });
              } else {
                dispatch({
                  type: "LOADING_ERROR",
                  error: "Found the excalidraw without any content, wtf?",
                });
              }
            })
            .catch((error) => {
              dispatch({ type: "LOADING_ERROR", error: error.message });
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
              dispatch({ type: "SYNC_SUCCESS" });
            })
            .catch(() => {
              dispatch({ type: "SYNC_ERROR" });
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
              dispatch({
                type: "SNAPSHOT",
                data: snapshot.data() as ExcalidrawData,
              });
            });
        },
        DIRTY: () => {
          const id = setTimeout(() => {
            dispatch({
              type: "SYNC",
            });
          }, 1000);

          return () => {
            clearTimeout(id);
          };
        },
      }),
    [context.state]
  );

  const onChange = useMemo(
    () =>
      debounce((elements, appState) => {
        dispatch({
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
          onClick={() => dispatch({ type: "TOGGLE_READONLY_MODE" })}
        >
          {state === "READONLY" ? "edit" : "view"}
        </button>
      )}
    </div>
  );

  return transform(context, {
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
