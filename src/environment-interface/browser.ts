import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { Environment } from ".";

import config from "../firebase.config.json";
import { createAuthentication } from "./authentication/browser";
import { createCopyImageToClipboard } from "./copyImageToClipboard/browser";
import { createLoom } from "./loom/browser";
import { createStorage } from "./storage/browser";

export const createBrowserEnvironment = (): Environment => {
  const app = firebase.initializeApp(config);

  return {
    authentication: createAuthentication(app),
    copyImageToClipboard: createCopyImageToClipboard(),
    loom: createLoom(),
    storage: createStorage(app),
  };
};
