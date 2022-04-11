import { createReducer } from "../../environment-interface";
import { Transition, Feature } from "./types";

import { hasChangedExcalidraw } from "../../utils";

export const reducer = createReducer<Feature>({
  LOADING: {
    "STORAGE:FETCH_EXCALIDRAW_SUCCESS": (
      _,
      { data, metadata, image }
    ): Transition => ({
      state: "LOADED",
      data,
      metadata,
      image,
      clipboard: {
        state: "NOT_COPIED",
      },
    }),
    "STORAGE:FETCH_EXCALIDRAW_ERROR": (_, { error }): Transition => ({
      state: "ERROR",
      error,
    }),
  },
  LOADED: {
    INITIALIZE_CANVAS_SUCCESS: (state): Transition => ({
      ...state,
      state: "EDIT",
    }),
  },
  EDIT: {
    EXCALIDRAW_CHANGE: (state, { data }): Transition =>
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
    COPY_TO_CLIPBOARD: (state): Transition => [
      {
        ...state,
        clipboard: {
          state: "COPIED",
        },
      },
      {
        cmd: "COPY_TO_CLIPBOARD",
        image: state.image,
      },
    ],
    "STORAGE:SAVE_TITLE_SUCCESS": (state, { title }): Transition => ({
      ...state,
      metadata: {
        ...state.metadata,
        title,
      },
    }),
    SAVE_TITLE: (state, { title }): Transition => [
      state,
      {
        cmd: "SAVE_TITLE",
        title,
      },
    ],
  },
  DIRTY: {
    SYNC: (state): Transition => ({
      ...state,
      state: "SYNCING",
    }),
    EXCALIDRAW_CHANGE: (state, { data }): Transition =>
      hasChangedExcalidraw(state.data, data)
        ? {
            ...state,
            state: "DIRTY",
            data,
          }
        : state,
  },
  SYNCING: {
    EXCALIDRAW_CHANGE: (state, { data }): Transition =>
      hasChangedExcalidraw(state.data, data)
        ? {
            ...state,
            state: "SYNCING_DIRTY",
            data,
          }
        : state,
    "STORAGE:SAVE_EXCALIDRAW_SUCCESS": (
      state,
      { image, metadata }
    ): Transition => ({
      ...state,
      state: "EDIT",
      metadata,
      image,
    }),
    "STORAGE:SAVE_EXCALIDRAW_ERROR": (_, { error }): Transition => ({
      state: "ERROR",
      error,
    }),
    "STORAGE:SAVE_EXCALIDRAW_OLD_VERSION": (state): Transition => ({
      ...state,
      state: "EDIT",
    }),
  },
  SYNCING_DIRTY: {
    EXCALIDRAW_CHANGE: (state, { data }): Transition =>
      hasChangedExcalidraw(state.data, data)
        ? {
            ...state,
            state: "SYNCING_DIRTY",
            data,
          }
        : state,
    "STORAGE:SAVE_EXCALIDRAW_SUCCESS": (state, { metadata }): Transition => ({
      ...state,
      metadata,
      state: "DIRTY",
    }),
    "STORAGE:SAVE_EXCALIDRAW_ERROR": (state): Transition => ({
      ...state,
      state: "DIRTY",
    }),
    "STORAGE:SAVE_EXCALIDRAW_OLD_VERSION": (state): Transition => ({
      ...state,
      state: "DIRTY",
    }),
  },
  ERROR: {},
});
