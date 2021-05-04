import { events } from "react-states";
import { Storage } from ".";

export const createStorage = (): Storage => ({
  events: events(),
  createExcalidraw: jest.fn(),
  fetchExcalidraw: jest.fn(),
  fetchPreviews: jest.fn(),
  saveExcalidraw: jest.fn(),
  getImageSrc: jest.fn(),
});
