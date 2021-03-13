import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import { Auth } from "./components/Auth";
import { AuthProvider } from "./features/AuthProvider";
import { createExcalidrawImage } from "./externals/createExcalidrawImage";
import { router } from "./externals/router";
import { auth, storage } from "./externals/firebase";
import { ExternalsProvider } from "./externals";
import { DevtoolsManager, DevtoolsProvider } from "react-states/devtools";

ReactDOM.render(
  <React.StrictMode>
    <DevtoolsProvider>
      <DevtoolsManager />
      <ExternalsProvider
        externals={{
          createExcalidrawImage,
          router,
          auth,
          storage,
        }}
      >
        <AuthProvider>
          <Auth />
        </AuthProvider>
      </ExternalsProvider>
    </DevtoolsProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
