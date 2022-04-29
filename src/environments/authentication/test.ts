import { createEmitter } from "react-states";
import { Authentication } from "../../environment-interface/authentication";

export const createAuthentication = (): Authentication => ({
  ...createEmitter(),
  signIn: jest.fn(),
});
