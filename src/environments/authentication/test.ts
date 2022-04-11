import { createSubscription } from "react-states";
import { Authentication } from "../authentication";

export const createAuthentication = (): Authentication => ({
  subscription: createSubscription(),
  signIn: jest.fn(),
});
