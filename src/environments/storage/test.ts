import { createEmitter } from "react-states";
import { Storage } from "../../environment-interface/storage";

export const createStorage = (): Storage => ({
  ...createEmitter(),
  createExcalidraw: jest.fn(),
  fetchExcalidraw: jest.fn(),
  fetchPreviews: jest.fn(),
  fetchUserPreviews: jest.fn(),
  saveExcalidraw: jest.fn(),
  getImageSrc: jest.fn(),
  saveTitle: jest.fn(),
});
