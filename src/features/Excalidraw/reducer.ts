import { createReducer } from "react-states";
import { ExcalidrawData } from "../../environment/storage";
import {
  ExcalidrawContext,
  ExcalidrawEvent,
  LOADING_SUCCESS,
  LOADING_ERROR,
  BLUR,
  SYNC,
  SYNC_SUCCESS,
  SYNC_ERROR,
  FOCUS,
  REFRESH,
  CONTINUE,
  SUBSCRIPTION_UPDATE,
  BaseContext,
} from "./types";

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
    [LOADING_SUCCESS]: ({ data, metadata, image }): ExcalidrawContext => ({
      state: "LOADED",
      data,
      metadata,
      image,
      clipboard: {
        state: "NOT_COPIED",
      },
    }),
    [LOADING_ERROR]: ({ error }): ExcalidrawContext => ({
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
              state: <const>"NOT_COPIED",
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
    [BLUR]: (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "UNFOCUSED",
    }),
    [SUBSCRIPTION_UPDATE]: onSubscriptionUpdate,
  },
  DIRTY: {
    [SYNC]: (_, currentContext): ExcalidrawContext => ({
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
    [BLUR]: (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "UNFOCUSED",
    }),
    [SUBSCRIPTION_UPDATE]: onSubscriptionUpdate,
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
    [SYNC_SUCCESS]: (
      { image, metadata },
      currentContext
    ): ExcalidrawContext => ({
      ...currentContext,
      state: "EDIT",
      metadata,
      image,
    }),
    [SYNC_ERROR]: (): ExcalidrawContext => ({
      state: "ERROR",
      error: "Unable to sync",
    }),
    [BLUR]: (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "UNFOCUSED",
    }),
    [SUBSCRIPTION_UPDATE]: onSubscriptionUpdate,
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
    [SYNC_SUCCESS]: (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "DIRTY",
    }),
    [SYNC_ERROR]: (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "DIRTY",
    }),
    [BLUR]: (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "UNFOCUSED",
    }),
    [SUBSCRIPTION_UPDATE]: onSubscriptionUpdate,
  },
  ERROR: {},
  UNFOCUSED: {
    [FOCUS]: (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "FOCUSED",
    }),
    [SYNC_SUCCESS]: (
      { image, metadata },
      currentContext
    ): ExcalidrawContext => ({
      ...currentContext,
      metadata,
      image,
    }),
  },
  FOCUSED: {
    [REFRESH]: (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "UPDATING",
    }),
    [CONTINUE]: (_, currentContext): ExcalidrawContext => ({
      ...currentContext,
      state: "EDIT",
    }),
  },
  UPDATING: {
    [LOADING_SUCCESS]: (
      { data, metadata, image },
      currentContext
    ): ExcalidrawContext => ({
      ...currentContext,
      state: "EDIT",
      data,
      metadata,
      image,
    }),
    [LOADING_ERROR]: ({ error }): ExcalidrawContext => ({
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
