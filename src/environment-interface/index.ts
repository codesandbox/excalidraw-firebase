import { Authentication, AuthenticationEvent } from "./authentication";
import { CopyImageToClipboard } from "./copyImageToClipboard";
import { Storage, StorageEvent } from "./storage";
import { Loom, LoomEvent } from "./loom";
import { defineEnvironment } from "react-states";

export type EnvironmentEvent = AuthenticationEvent | StorageEvent | LoomEvent;

export interface Environment {
  storage: Storage;
  authentication: Authentication;
  copyImageToClipboard: CopyImageToClipboard;
  loom: Loom;
}

const {
  EnvironmentProvider,
  useEnvironment,
  createEnvironment,
  createReducer,
  useReducer,
} = defineEnvironment<Environment, EnvironmentEvent>();

export {
  EnvironmentProvider,
  useEnvironment,
  createEnvironment,
  createReducer,
  useReducer,
};
