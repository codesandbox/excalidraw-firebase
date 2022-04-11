import { createSubscription } from "react-states";
import { Storage } from "../storage";

export const createStorage = (): Storage => ({
  subscription: createSubscription(),
  createExcalidraw: jest.fn(),
  fetchExcalidraw: jest.fn(),
  fetchPreviews: jest.fn(),
  fetchUserPreviews: jest.fn(),
  saveExcalidraw: jest.fn(),
  getImageSrc: jest.fn(),
  saveTitle: jest.fn(),
});
