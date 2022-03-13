import React from "react";
import ReactDOM from "react-dom";
import firebase from "firebase/compat/app";
import { DevtoolsManager, DevtoolsProvider } from "react-states/devtools";

import "./index.css";

import config from "./firebase.config.json";
import { Pages } from "./pages";
import { AuthProvider } from "./features/Auth";
import { EnvironmentProvider } from "./environment";
import { createStorage } from "./environment/storage/browser";
import { createAuthentication } from "./environment/authentication/browser";
import { createCopyImageToClipboard } from "./environment/copyImageToClipboard/browser";
import { createLoom } from "./environment/loom/browser";

firebase.initializeApp(config);

// Polyfill for Loom
if (typeof (window as any).global === "undefined") {
  (window as any).global = window;
}

const app = (
  <EnvironmentProvider
    environment={{
      authentication: createAuthentication(),
      storage: createStorage(),
      copyImageToClipboard: createCopyImageToClipboard(),
      loom: createLoom(),
    }}
  >
    <AuthProvider>
      <Pages />
    </AuthProvider>
  </EnvironmentProvider>
);

ReactDOM.render(
  <React.StrictMode>
    {import.meta.env.PROD ? (
      app
    ) : (
      <DevtoolsProvider>
        <DevtoolsManager />
        {app}
      </DevtoolsProvider>
    )}
  </React.StrictMode>,
  document.getElementById("root")
);
