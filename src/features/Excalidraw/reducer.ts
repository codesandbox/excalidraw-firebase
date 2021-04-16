import { transitions } from "react-states";
import { ExcalidrawData, ExcalidrawElement } from "../../environment/storage";
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
  SUBSCRIPTION_UPDATE,
  BaseContext,
} from "./types";

import { hasChangedExcalidraw } from "./utils";

const mergeElements = (
  newElements: ExcalidrawElement[],
  oldElements: ExcalidrawElement[]
): ExcalidrawElement[] => {
  const initialElements = oldElements.reduce<{
    [id: string]: ExcalidrawElement;
  }>((aggr, element) => {
    aggr[element.id] = element;

    return aggr;
  }, {});
  const mergedElements = newElements.reduce((aggr, element) => {
    const isExistingElement = Boolean(aggr[element.id]);
    const isNewVersion =
      isExistingElement && aggr[element.id].version < element.version;

    if (!isExistingElement || isNewVersion) {
      aggr[element.id] = element;
    }

    return aggr;
  }, initialElements);

  return Object.values(mergedElements);
};

const getChangedData = (
  newData: ExcalidrawData,
  oldData: ExcalidrawData
): ExcalidrawData | undefined => {
  if (newData.version === oldData.version) {
    return;
  }

  return {
    ...newData,
    elements: mergeElements(newData.elements, oldData.elements),
  };
};

const onSubscriptionUpdate = (
  { data }: { data: ExcalidrawData },
  currentContext: ExcalidrawContext & BaseContext
): ExcalidrawContext => {
  const changedData = getChangedData(data, currentContext.data);

  return changedData
    ? { ...currentContext, state: "UPDATING_FROM_PEER", data: changedData }
    : currentContext;
};

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
            clipboard: {
              state: "NOT_COPIED",
            },
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
    [SUBSCRIPTION_UPDATE]: onSubscriptionUpdate,
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
    [SUBSCRIPTION_UPDATE]: onSubscriptionUpdate,
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
    [SUBSCRIPTION_UPDATE]: onSubscriptionUpdate,
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
    [SUBSCRIPTION_UPDATE]: onSubscriptionUpdate,
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
    [SUBSCRIPTION_UPDATE]: onSubscriptionUpdate,
  },
  UPDATING_FROM_PEER: {
    EXCALIDRAW_CHANGE: ({ appState, elements, version }, currentContext) => ({
      ...currentContext,
      state: "DIRTY",
      appState,
      elements,
      version,
    }),
  },
});
