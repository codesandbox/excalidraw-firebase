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
      state: "LOADED";
      initialExcalidraw: ExcalidrawData;
      excalidraw: ExcalidrawData;
    }
  | {
      state: "ERROR";
      error: string;
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
    }
  | {
      type: "SYNC_SUCCESS";
    }
  | {
      type: "SYNC_ERROR";
      error: string;
    };

const SYNC = (
  { elements }: PickAction<Action, "SYNC">,
  currentContext: PickState<Context, "LOADED" | "SYNCING">
): PickState<Context, "LOADED" | "SYNCING"> => ({
  state: "SYNCING",
  initialExcalidraw: currentContext.initialExcalidraw,
  excalidraw: { ...currentContext.excalidraw, elements },
});

export const Excalidraw = ({ id }: { id: string }) => {
  const [context, dispatch] = useReducer(
    (context: Context, action: Action) =>
      transition(context, action, {
        LOADING: {
          LOADING_SUCCESS: ({ excalidraw }) => ({
            state: "LOADED",
            initialExcalidraw: excalidraw,
            excalidraw,
          }),
          LOADING_ERROR: ({ error }) => ({ state: "ERROR", error }),
        },
        LOADED: {
          SYNC,
        },
        SYNCING: {
          SYNC,
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
          firebase
            .firestore()
            .collection(EXCALIDRAWS_COLLECTION)
            .doc(id)
            .set(
              {
                elements: excalidraw.elements,
              },
              {
                merge: true,
              }
            )
            .then(() => {});
        },
      }),
    [context]
  );

  const onChange = useCallback(
    (elements) =>
      dispatch({
        type: "SYNC",
        elements,
      }),
    []
  );

  const renderExcalidraw = ({
    initialExcalidraw,
  }: PickState<Context, "LOADED" | "SYNCING">) => (
    <ExcalidrawCanvas data={initialExcalidraw} onChange={onChange} />
  );

  return transform(context, {
    LOADING: () => "Loading...",
    ERROR: ({ error }) => `OMG, error, ${error}`,
    LOADED: renderExcalidraw,
    SYNCING: renderExcalidraw,
  });
};
