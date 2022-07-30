import { ExcalidrawState, ExcalidrawAction, PrivateAction } from "./types";
import { StorageEvent } from "../../../environment-interface/storage";

import { transition } from "react-states";
import { hasChangedExcalidraw } from "../../../utils";

export const reducer = (
  prevState: ExcalidrawState,
  action: ExcalidrawAction | PrivateAction | StorageEvent
) =>
  transition(prevState, action, {
    LOADING: {
      "STORAGE:FETCH_EXCALIDRAW_SUCCESS": (_, { data, metadata, image }) => ({
        state: "LOADED",
        data,
        metadata,
        image,
        clipboard: {
          state: "NOT_COPIED",
        },
      }),
      "STORAGE:FETCH_EXCALIDRAW_ERROR": (_, { error }) => ({
        state: "ERROR",
        error,
      }),
    },
    LOADED: {
      INITIALIZE_CANVAS_SUCCESS: (state) => ({
        ...state,
        state: "EDIT",
      }),
    },
    EDIT: {
      EXCALIDRAW_CHANGE: (state, { data }) =>
        hasChangedExcalidraw(state.data, data)
          ? {
              ...state,
              clipboard: {
                state: "NOT_COPIED",
              },
              state: "DIRTY",
              data,
            }
          : state,
      COPY_TO_CLIPBOARD: (state) => ({
        ...state,
        clipboard: {
          state: "COPIED",
        },
      }),
      "STORAGE:SAVE_TITLE_SUCCESS": (state, { title }) => ({
        ...state,
        metadata: {
          ...state.metadata,
          title,
        },
      }),
      SAVE_TITLE: (state) => ({
        ...state,
      }),
    },
    DIRTY: {
      SYNC: (state) => ({
        ...state,
        state: "SYNCING",
      }),
      EXCALIDRAW_CHANGE: (state, { data }) =>
        hasChangedExcalidraw(state.data, data)
          ? {
              ...state,
              state: "DIRTY",
              data,
            }
          : state,
    },
    SYNCING: {
      EXCALIDRAW_CHANGE: (state, { data }) =>
        hasChangedExcalidraw(state.data, data)
          ? {
              ...state,
              state: "SYNCING_DIRTY",
              data,
            }
          : state,
      "STORAGE:SAVE_EXCALIDRAW_SUCCESS": (state, { image, metadata }) => ({
        ...state,
        state: "EDIT",
        metadata,
        image,
      }),
      "STORAGE:SAVE_EXCALIDRAW_ERROR": (_, { error }) => ({
        state: "ERROR",
        error,
      }),
      "STORAGE:SAVE_EXCALIDRAW_OLD_VERSION": (state) => ({
        ...state,
        state: "EDIT",
      }),
    },
    SYNCING_DIRTY: {
      EXCALIDRAW_CHANGE: (state, { data }) =>
        hasChangedExcalidraw(state.data, data)
          ? {
              ...state,
              state: "SYNCING_DIRTY",
              data,
            }
          : state,
      "STORAGE:SAVE_EXCALIDRAW_SUCCESS": (state, { metadata }) => ({
        ...state,
        metadata,
        state: "DIRTY",
      }),
      "STORAGE:SAVE_EXCALIDRAW_ERROR": (state) => ({
        ...state,
        state: "DIRTY",
      }),
      "STORAGE:SAVE_EXCALIDRAW_OLD_VERSION": (state) => ({
        ...state,
        state: "DIRTY",
      }),
    },
    ERROR: {},
  });
