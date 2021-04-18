import { ExcalidrawData, ExcalidrawElement } from "./types";

export const hasChangedExcalidraw = (
  oldData: ExcalidrawData,
  newData: ExcalidrawData
) => {
  return (
    oldData.version !== newData.version ||
    oldData.appState.viewBackgroundColor !==
      newData.appState.viewBackgroundColor
  );
};

export const mergeElements = (
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

export const getChangedData = (
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
