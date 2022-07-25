import { createEmitter } from "react-states";
import { Authentication } from ".";

export const createAuthentication = (): Authentication => ({
  ...createEmitter(),
  signIn: jest.fn(),
});
