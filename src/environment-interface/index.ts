import { Authentication } from "./authentication";
import { CopyImageToClipboard } from "./copyImageToClipboard";
import { Storage } from "./storage";
import { Loom } from "./loom";
import { Router } from "./router";
import { createEnvironment } from "react-environment-interface";

export interface Environment {
  storage: Storage;
  authentication: Authentication;
  copyImageToClipboard: CopyImageToClipboard;
  loom: Loom;
  router: Router;
}

const { EnvironmentProvider, useEnvironment } =
  createEnvironment<Environment>();

export { EnvironmentProvider, useEnvironment };
