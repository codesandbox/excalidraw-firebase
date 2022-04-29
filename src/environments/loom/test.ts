import { createEmitter } from "react-states";
import { Loom } from "../../environment-interface/loom";

export const createLoom = (): Loom => ({
  ...createEmitter(),
  configure: jest.fn(),
  openVideo: jest.fn(),
});
