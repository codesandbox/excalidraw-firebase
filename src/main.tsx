import React from "react";
import { createRoot } from "react-dom/client";
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

const container = document.getElementById("root")!;
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <React.StrictMode>
    {import.meta.env.PROD ? app : <DevtoolsProvider>{app}</DevtoolsProvider>}
  </React.StrictMode>,
);
