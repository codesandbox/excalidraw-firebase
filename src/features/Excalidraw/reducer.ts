import { createReducer } from "react-states";
import { ExcalidrawData } from "../../environment/storage";
import { ExcalidrawContext, ExcalidrawEvent, BaseContext } from "./types";

import { getChangedData, hasChangedExcalidraw } from "../../utils";

const onDataUpdate = (
  { data }: { data: ExcalidrawData },
  currentContext: ExcalidrawContext & BaseContext
): ExcalidrawContext => {
  const changedData = getChangedData(data, currentContext.data);

  return changedData
    ? {
        ...currentContext,
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
    "STORAGE:EXCALIDRAW_DATA_UPDATE": onDataUpdate,
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
    "STORAGE:EXCALIDRAW_DATA_UPDATE": onDataUpdate,
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
    "STORAGE:SAVE_EXCALIDRAW_ERROR": ({ error }): ExcalidrawContext => ({
      state: "ERROR",
      error,
    }),
    "STORAGE:EXCALIDRAW_DATA_UPDATE": onDataUpdate,
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
      { metadata },
      currentContext
    ): ExcalidrawContext => ({
      ...currentContext,
      metadata,
      state: "DIRTY",
    }),
    "STORAGE:SAVE_EXCALIDRAW_ERROR": (
      _,
      currentContext
    ): ExcalidrawContext => ({
      ...currentContext,
      state: "DIRTY",
    }),
    "STORAGE:EXCALIDRAW_DATA_UPDATE": onDataUpdate,
  },
  ERROR: {},
});
