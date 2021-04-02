import React from "react";
import ReactDOM from "react-dom";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { DevtoolsManager, DevtoolsProvider } from "react-states/devtools";

import "./index.css";

import config from "./firebase.config.json";
import { Auth } from "./components/Auth";
import { AuthFeature } from "./features/Auth";
import { Environment } from "./environment";
import { createCreateExcalidrawImage } from "./environment/createExcalidrawImage/browser";
import { createStorage } from "./environment/storage/browser";
import { createOnVisibilityChange } from "./environment/onVisibilityChange/browser";
import { createAuth } from "./environment/auth/browser";

firebase.initializeApp(config);

const app = (
  <Environment
    environment={{
      auth: createAuth(),
      createExcalidrawImage: createCreateExcalidrawImage(),
      onVisibilityChange: createOnVisibilityChange(),
      storage: createStorage(),
    }}
  >
    <AuthFeature>
      <Auth />
    </AuthFeature>
  </Environment>
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
