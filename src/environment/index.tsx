import { Authentication } from "./authentication";
import { CopyImageToClipboard } from "./copyImageToClipboard";
import { Storage } from "./storage";
import { Loom } from "./loom";
import { createEnvironment } from "react-states";

export interface Environment {
  storage: Storage;
  authentication: Authentication;
  copyImageToClipboard: CopyImageToClipboard;
  loom: Loom;
}

const { EnvironmentProvider, useEnvironment } =
  createEnvironment<Environment>();

export { EnvironmentProvider, useEnvironment };
