import React from "react";
import ReactDOM from "react-dom";

import { DevtoolsProvider } from "react-states/devtools";

import "./index.css";

import { Pages } from "./pages";
import { AuthProvider } from "./features/Auth";
import { EnvironmentProvider } from "./environment-interface";
import { environment } from "./environments/browser";

// Polyfill for Loom
if (typeof (window as any).global === "undefined") {
  (window as any).global = window;
}

const app = (
  <EnvironmentProvider environment={environment}>
    <AuthProvider>
      <Pages />
    </AuthProvider>
  </EnvironmentProvider>
);

ReactDOM.render(
  import.meta.env.PROD ? app : <DevtoolsProvider show>{app}</DevtoolsProvider>,
  document.getElementById("root")
);

/*
  - Optional action in `States`
  - Rename `States` to reflect being a return type of useReducer
  - Always on filter actions
  - Weird behaviour on same component, different versions, logging actions
  - Possible to identify strict mode?
  - Change "renderReducer" to be more explicit testing a reducer, also show tests with UI
*/
