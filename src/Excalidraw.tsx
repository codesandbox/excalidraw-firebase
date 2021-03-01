import React, { useCallback, useEffect, useReducer } from "react";
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
      initialExcalidraw: ExcalidrawData;
    }
  | {
      state: "ERROR";
      error: string;
    }
  | {
      state: "SYNCED";
      initialExcalidraw: ExcalidrawData;
      excalidraw: ExcalidrawData;
    }
  | {
      state: "SYNCING";
      initialExcalidraw: ExcalidrawData;
      excalidraw: ExcalidrawData;
    };

type Action =
  | {
      type: "LOADING_SUCCESS";
      excalidraw: ExcalidrawData;
    }
  | {
      type: "LOADING_ERROR";
      error: string;
    }
  | {
      type: "SYNC";
      elements: any[];
      appState: any;
    }
  | {
      type: "SNAPSHOT";
      excalidraw: ExcalidrawData;
    }
  | {
      type: "SYNC_ERROR";
      error: string;
    }
  | {
      type: "TOGGLE_READONLY_MODE";
    };

const SYNC = (
  { elements, appState }: PickAction<Action, "SYNC">,
  currentContext: PickState<Context, "SYNCED" | "SYNCING">
): PickState<Context, "SYNCED" | "SYNCING"> => ({
  state: "SYNCING",
  initialExcalidraw: currentContext.initialExcalidraw,
  excalidraw: {
    ...currentContext.excalidraw,
    elements,
    appState: {
      ...currentContext.excalidraw.appState,
      zoom: appState.zoom,
      scrollX: appState.scrollX,
      scrollY: appState.scrollY,
    },
  },
});

const TOGGLE_READONLY_MODE = (
  _: Action,
  currentContext: PickState<Context, "READONLY" | "SYNCED" | "SYNCING">
): PickState<Context, "SYNCED" | "READONLY"> =>
  currentContext.state === "READONLY"
    ? {
        ...currentContext,
        excalidraw: currentContext.initialExcalidraw,
        state: "SYNCED",
      }
    : {
        ...currentContext,
        state: "READONLY",
      };

export const Excalidraw = ({ id }: { id: string }) => {
  const [context, dispatch] = useReducer(
    (context: Context, action: Action) =>
      transition(context, action, {
        LOADING: {
          LOADING_SUCCESS: ({ excalidraw }) => ({
            state: "READONLY",
            initialExcalidraw: excalidraw,
          }),
          LOADING_ERROR: ({ error }) => ({ state: "ERROR", error }),
        },
        READONLY: {
          TOGGLE_READONLY_MODE,
          SNAPSHOT: ({ excalidraw }) => ({
            state: "READONLY",
            initialExcalidraw: excalidraw,
          }),
        },
        SYNCED: {
          SYNC,
          TOGGLE_READONLY_MODE,
        },
        SYNCING: {
          SYNC,
          TOGGLE_READONLY_MODE,
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
              const excalidraw = doc.data();

              if (excalidraw) {
                dispatch({
                  type: "LOADING_SUCCESS",
                  excalidraw: excalidraw as ExcalidrawData,
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
        SYNCING: ({ excalidraw }) => {
          console.log("SYNCING!");
          firebase
            .firestore()
            .collection(EXCALIDRAWS_COLLECTION)
            .doc(id)
            .set(
              {
                elements: excalidraw.elements,
                appState: excalidraw.appState,
              },
              {
                merge: true,
              }
            )
            .then(() => {});
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
              console.log("Got snapshot!!", snapshot.data());
              dispatch({
                type: "SNAPSHOT",
                excalidraw: snapshot.data() as ExcalidrawData,
              });
            });
        },
      }),
    [context]
  );

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      console.log(event.key);
      if (event.key === " ") {
        dispatch({ type: "TOGGLE_READONLY_MODE" });
      }
    };

    window.addEventListener("keypress", listener);

    return () => {
      window.removeEventListener("keypress", listener);
    };
  }, []);

  const onChange = useCallback(
    (elements, appState) =>
      dispatch({
        type: "SYNC",
        elements,
        appState,
      }),
    []
  );

  const renderExcalidraw = ({
    initialExcalidraw,
    state,
  }: PickState<Context, "READONLY" | "SYNCED" | "SYNCING">) => (
    <ExcalidrawCanvas
      data={initialExcalidraw}
      onChange={onChange}
      readOnly={state === "READONLY"}
    />
  );

  return transform(context, {
    LOADING: () => "Loading...",
    ERROR: ({ error }) => `OMG, error, ${error}`,
    SYNCED: renderExcalidraw,
    READONLY: renderExcalidraw,
    SYNCING: renderExcalidraw,
  });
};
