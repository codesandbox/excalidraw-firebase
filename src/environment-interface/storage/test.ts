import { createEmitter } from "react-environment-interface";
import { Storage } from ".";

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
