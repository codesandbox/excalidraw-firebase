import { createEmitter } from "react-environment-interface";
import { Loom } from ".";

export const createLoom = (): Loom => ({
  ...createEmitter(),
  configure: jest.fn(),
  openVideo: jest.fn(),
});
