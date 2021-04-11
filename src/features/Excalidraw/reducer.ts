import { transitions } from "react-states";
import {
  ExcalidrawContext,
  ExcalidrawAction,
  LOADING_SUCCESS,
  LOADING_ERROR,
  BLUR,
  SYNC,
  SYNC_SUCCESS,
  SYNC_ERROR,
  FOCUS,
  REFRESH,
  CONTINUE,
} from "./types";

import { hasChangedExcalidraw } from "./utils";

export const reducer = transitions<ExcalidrawContext, ExcalidrawAction>({
  LOADING: {
    [LOADING_SUCCESS]: ({ data, metadata, image }) => ({
      state: "LOADED",
      data,
      metadata,
      image,
      clipboard: {
        state: "NOT_COPIED",
      },
    }),
    [LOADING_ERROR]: ({ error }) => ({ state: "ERROR", error }),
  },
  LOADED: {
    INITIALIZE_CANVAS_SUCCESS: (_, currentContext) => ({
      ...currentContext,
      state: "EDIT",
    }),
  },
  EDIT: {
    EXCALIDRAW_CHANGE: (newData, currentContext) =>
      hasChangedExcalidraw(currentContext.data, newData)
        ? {
            ...currentContext,
            state: "DIRTY",
            data: newData,
          }
        : currentContext,
    COPY_TO_CLIPBOARD: (_, currentContext) => ({
      ...currentContext,
      clipboard: {
        state: "COPIED",
      },
    }),
    [BLUR]: (_, currentContext) => ({
      ...currentContext,
      state: "UNFOCUSED",
    }),
  },
  DIRTY: {
    [SYNC]: (_, currentContext) => ({
      ...currentContext,
      state: "SYNCING",
    }),
    EXCALIDRAW_CHANGE: (newData, currentContext) =>
      hasChangedExcalidraw(currentContext.data, newData)
        ? {
            ...currentContext,
            state: "DIRTY",
            data: newData,
          }
        : currentContext,
    [BLUR]: (_, currentContext) => ({
      ...currentContext,
      state: "UNFOCUSED",
    }),
  },
  SYNCING: {
    EXCALIDRAW_CHANGE: (newData, currentContext) =>
      hasChangedExcalidraw(currentContext.data, newData)
        ? {
            ...currentContext,
            state: "SYNCING_DIRTY",
            data: newData,
          }
        : currentContext,
    [SYNC_SUCCESS]: ({ image, metadata }, currentContext) => ({
      ...currentContext,
      state: "EDIT",
      metadata,
      image,
    }),
    [SYNC_ERROR]: (_) => ({ state: "ERROR", error: "Unable to sync" }),
    [BLUR]: (_, currentContext) => ({
      ...currentContext,
      state: "UNFOCUSED",
    }),
  },
  SYNCING_DIRTY: {
    EXCALIDRAW_CHANGE: (newData, currentContext) =>
      hasChangedExcalidraw(currentContext.data, newData)
        ? {
            ...currentContext,
            state: "SYNCING_DIRTY",
            data: newData,
          }
        : currentContext,
    [SYNC_SUCCESS]: (_, currentContext) => ({
      ...currentContext,
      state: "DIRTY",
    }),
    [SYNC_ERROR]: (_, currentContext) => ({
      ...currentContext,
      state: "DIRTY",
    }),
    [BLUR]: (_, currentContext) => ({
      ...currentContext,
      state: "UNFOCUSED",
    }),
  },
  ERROR: {},
  UNFOCUSED: {
    [FOCUS]: (_, currentContext) => ({
      ...currentContext,
      state: "FOCUSED",
    }),
    [SYNC_SUCCESS]: ({ image, metadata }, currentContext) => ({
      ...currentContext,
      metadata,
      image,
    }),
  },
  FOCUSED: {
    [REFRESH]: (_, currentContext) => ({
      ...currentContext,
      state: "UPDATING",
    }),
    [CONTINUE]: (_, currentContext) => ({
      ...currentContext,
      state: "EDIT",
    }),
  },
  UPDATING: {
    [LOADING_SUCCESS]: ({ data, metadata, image }, currentContext) => ({
      ...currentContext,
      state: "EDIT",
      data,
      metadata,
      image,
    }),
    [LOADING_ERROR]: ({ error }) => ({ state: "ERROR", error }),
  },
});
