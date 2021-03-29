import { createResultMock, ResultMock } from "react-states";
import { Storage } from ".";

export const createStorageMock = (): {
  [T in keyof Storage]: ResultMock<Storage[T]>;
} => ({
  createExcalidraw: createResultMock(),
  getExcalidraw: createResultMock(),
  getPreviews: createResultMock(),
  saveExcalidraw: createResultMock(),
  saveImage: createResultMock(),
  getImageSrc: createResultMock(),
  hasExcalidrawUpdated: createResultMock(),
});
