import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import { Auth } from "./components/Auth";
import { AuthProvider } from "./features/Auth";
import { createExcalidrawImage } from "./environment/createExcalidrawImage";
import { router } from "./environment/router";
import { auth, storage } from "./environment/firebase";
import { EnvironmentProvider } from "./environment";
import { DevtoolsManager, DevtoolsProvider } from "react-states/devtools";

const app = (
  <EnvironmentProvider
    environment={{
      createExcalidrawImage,
      router,
      auth,
      storage,
    }}
  >
    <AuthProvider>
      <Auth />
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
