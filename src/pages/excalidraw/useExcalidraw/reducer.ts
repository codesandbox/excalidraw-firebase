import {
  ExcalidrawState,
  BaseState,
  ExcalidrawAction,
  PrivateAction,
} from "./types";
import { StorageEvent } from "../../../environment-interface/storage";

import { $COMMAND, transition } from "react-states";
import { hasChangedExcalidraw } from "../../../utils";

export const reducer = (
  state: ExcalidrawState,
  action: ExcalidrawAction | PrivateAction | StorageEvent
) =>
  transition(state, action, {
    LOADING: {
      "STORAGE:FETCH_EXCALIDRAW_SUCCESS": (
        _,
        { data, metadata, image }
      ): ExcalidrawState => ({
        state: "LOADED",
        data,
        metadata,
        image,
        clipboard: {
          state: "NOT_COPIED",
        },
      }),
      "STORAGE:FETCH_EXCALIDRAW_ERROR": (_, { error }): ExcalidrawState => ({
        state: "ERROR",
        error,
      }),
    },
    LOADED: {
      INITIALIZE_CANVAS_SUCCESS: (state): ExcalidrawState => ({
        ...state,
        state: "EDIT",
      }),
    },
    EDIT: {
      EXCALIDRAW_CHANGE: (state, { data }): ExcalidrawState =>
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
      COPY_TO_CLIPBOARD: (state): ExcalidrawState => ({
        ...state,
        clipboard: {
          state: "COPIED",
        },
        [$COMMAND]: {
          cmd: "COPY_TO_CLIPBOARD",
          image: state.image,
        },
      }),
      "STORAGE:SAVE_TITLE_SUCCESS": (state, { title }): ExcalidrawState => ({
        ...state,
        metadata: {
          ...state.metadata,
          title,
        },
      }),
      SAVE_TITLE: (state, { title }): ExcalidrawState => ({
        ...state,
        [$COMMAND]: {
          cmd: "SAVE_TITLE",
          title,
        },
      }),
    },
    DIRTY: {
      SYNC: (state): ExcalidrawState => ({
        ...state,
        state: "SYNCING",
      }),
      EXCALIDRAW_CHANGE: (state, { data }): ExcalidrawState =>
        hasChangedExcalidraw(state.data, data)
          ? {
              ...state,
              state: "DIRTY",
              data,
            }
          : state,
    },
    SYNCING: {
      EXCALIDRAW_CHANGE: (state, { data }): ExcalidrawState =>
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
      ): ExcalidrawState => ({
        ...state,
        state: "EDIT",
        metadata,
        image,
      }),
      "STORAGE:SAVE_EXCALIDRAW_ERROR": (_, { error }): ExcalidrawState => ({
        state: "ERROR",
        error,
      }),
      "STORAGE:SAVE_EXCALIDRAW_OLD_VERSION": (state): ExcalidrawState => ({
        ...state,
        state: "EDIT",
      }),
    },
    SYNCING_DIRTY: {
      EXCALIDRAW_CHANGE: (state, { data }): ExcalidrawState =>
        hasChangedExcalidraw(state.data, data)
          ? {
              ...state,
              state: "SYNCING_DIRTY",
              data,
            }
          : state,
      "STORAGE:SAVE_EXCALIDRAW_SUCCESS": (
        state,
        { metadata }
      ): ExcalidrawState => ({
        ...state,
        metadata,
        state: "DIRTY",
      }),
      "STORAGE:SAVE_EXCALIDRAW_ERROR": (state): ExcalidrawState => ({
        ...state,
        state: "DIRTY",
      }),
      "STORAGE:SAVE_EXCALIDRAW_OLD_VERSION": (state): ExcalidrawState => ({
        ...state,
        state: "DIRTY",
      }),
    },
    ERROR: {},
  });
