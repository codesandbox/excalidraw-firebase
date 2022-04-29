import React from "react";
import ReactDOM from "react-dom";
import { DevtoolsProvider } from "react-states/devtools";
import "./index.css";
import { Pages } from "./pages";

import { EnvironmentProvider } from "./environment-interface";
import { environment } from "./environments/browser";

// Polyfill for Loom
if (typeof (window as any).global === "undefined") {
  (window as any).global = window;
}

const app = (
  <EnvironmentProvider environment={environment}>
    <Pages />
  </EnvironmentProvider>
);

ReactDOM.render(
  <React.StrictMode>
    {import.meta.env.PROD ? app : <DevtoolsProvider>{app}</DevtoolsProvider>}
  </React.StrictMode>,
  document.getElementById("root")
);
