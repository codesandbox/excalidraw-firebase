import { createReducer } from "react-states";
import { ExcalidrawData } from "../../environment/storage";
import { ExcalidrawContext, ExcalidrawEvent, BaseContext } from "./types";

import { getChangedData, hasChangedExcalidraw } from "./utils";

const onSubscriptionUpdate = (
  { data }: { data: ExcalidrawData },
  currentContext: ExcalidrawContext & BaseContext
): ExcalidrawContext => {
  const changedData = getChangedData(data, currentContext.data);

  return changedData
    ? {
        ...currentContext,
        state: "UPDATING_FROM_PEER",
        data: changedData,
      }
    : currentContext;
};

export const excalidrawReducer = createReducer<
  ExcalidrawContext,
  ExcalidrawEvent
>({
  LOADING: {
    "STORAGE:FETCH_EXCALIDRAW_SUCCESS": ({
      data,
      metadata,
      image,
    }): ExcalidrawContext => ({
      state: "LOADED",
      data,
      metadata,
      image,
      clipboard: {
        state: "NOT_COPIED",
      },
    }),
    "STORAGE:FETCH_EXCALIDRAW_ERROR": ({ error }): ExcalidrawContext => ({
      state: "ERROR",
      error,
    }),
  },
  LOADED: {
    INITIALIZE_CANVAS_SUCCESS: (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "EDIT",
    }),
  },
  EDIT: {
    EXCALIDRAW_CHANGE: ({ data }, currentContext): ExcalidrawContext =>
      hasChangedExcalidraw(currentContext.data, data)
        ? {
            ...currentContext,
            clipboard: {
              state: "NOT_COPIED",
            },
            state: "DIRTY",
            data,
          }
        : currentContext,
    COPY_TO_CLIPBOARD: (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      clipboard: {
        state: "COPIED",
      },
    }),
    "VISIBILITY:HIDDEN": (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "UNFOCUSED",
    }),
    SUBSCRIPTION_UPDATE: onSubscriptionUpdate,
  },
  DIRTY: {
    SYNC: (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "SYNCING",
    }),
    EXCALIDRAW_CHANGE: ({ data }, currentContext): ExcalidrawContext =>
      hasChangedExcalidraw(currentContext.data, data)
        ? {
            ...currentContext,
            state: "DIRTY",
            data,
          }
        : currentContext,
    "VISIBILITY:HIDDEN": (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "UNFOCUSED",
    }),
    SUBSCRIPTION_UPDATE: onSubscriptionUpdate,
  },
  SYNCING: {
    EXCALIDRAW_CHANGE: ({ data }, currentContext): ExcalidrawContext =>
      hasChangedExcalidraw(currentContext.data, data)
        ? {
            ...currentContext,
            state: "SYNCING_DIRTY",
            data,
          }
        : currentContext,
    "STORAGE:SAVE_EXCALIDRAW_SUCCESS": (
      { image, metadata },
      currentContext
    ): ExcalidrawContext => ({
      ...currentContext,
      state: "EDIT",
      metadata,
      image,
    }),
    "STORAGE:SAVE_EXCALIDRAW_ERROR": (): ExcalidrawContext => ({
      state: "ERROR",
      error: "Unable to sync",
    }),
    "VISIBILITY:HIDDEN": (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "UNFOCUSED",
    }),
    SUBSCRIPTION_UPDATE: onSubscriptionUpdate,
  },
  SYNCING_DIRTY: {
    EXCALIDRAW_CHANGE: ({ data }, currentContext): ExcalidrawContext =>
      hasChangedExcalidraw(currentContext.data, data)
        ? {
            ...currentContext,
            state: "SYNCING_DIRTY",
            data,
          }
        : currentContext,
    "STORAGE:SAVE_EXCALIDRAW_SUCCESS": (
      _,
      currentContext
    ): ExcalidrawContext => ({
      ...currentContext,
      state: "DIRTY",
    }),
    "STORAGE:SAVE_EXCALIDRAW_ERROR": (
      _,
      currentContext
    ): ExcalidrawContext => ({
      ...currentContext,
      state: "DIRTY",
    }),
    "VISIBILITY:HIDDEN": (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "UNFOCUSED",
    }),
    SUBSCRIPTION_UPDATE: onSubscriptionUpdate,
  },
  ERROR: {},
  UNFOCUSED: {
    "VISIBILITY:VISIBLE": (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "FOCUSED",
    }),
    "STORAGE:SAVE_EXCALIDRAW_SUCCESS": (
      { image, metadata },
      currentContext
    ): ExcalidrawContext => ({
      ...currentContext,
      metadata,
      image,
    }),
  },
  FOCUSED: {
    REFRESH: (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "UPDATING",
    }),
    CONTINUE: (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "EDIT",
    }),
  },
  UPDATING: {
    "STORAGE:FETCH_EXCALIDRAW_SUCCESS": (
      { data, metadata, image },
      currentContext
    ): ExcalidrawContext => ({
      ...currentContext,
      state: "EDIT",
      data,
      metadata,
      image,
    }),
    "STORAGE:FETCH_EXCALIDRAW_ERROR": ({ error }): ExcalidrawContext => ({
      state: "ERROR",
      error,
    }),
  },
  UPDATING_FROM_PEER: {
    EXCALIDRAW_CHANGE: ({ data }, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "DIRTY",
      data,
    }),
  },
});
