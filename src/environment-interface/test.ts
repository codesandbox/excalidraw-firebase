import { Environment } from ".";
import { createAuthentication } from "./authentication/test";
import { createCopyImageToClipboard } from "./copyImageToClipboard/test";
import { createLoom } from "./loom/test";
import { createStorage } from "./storage/test";

export const createTestEnvironment = (): Environment => {
  return {
    authentication: createAuthentication(),
    copyImageToClipboard: createCopyImageToClipboard(),
    loom: createLoom(),
    storage: createStorage(),
  };
};
