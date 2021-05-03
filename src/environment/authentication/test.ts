import { events } from "react-states";
import { Authentication } from ".";

export const createAuthentication = (): Authentication => ({
  events: events(),
  signIn: jest.fn(),
});
