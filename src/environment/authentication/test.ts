import { createSubscription } from "react-states";
import { Authentication } from ".";

export const createAuthentication = (): Authentication => ({
  subscription: createSubscription(),
  signIn: jest.fn(),
});
