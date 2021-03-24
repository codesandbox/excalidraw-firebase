import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import { Auth } from "./components/Auth";
import { AuthProvider } from "./features/Auth";
import * as productionEnvironment from "./environment/production";
import { EnvironmentProvider } from "./environment";
import { DevtoolsManager, DevtoolsProvider } from "react-states/devtools";

const app = (
  <EnvironmentProvider environment={productionEnvironment}>
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
