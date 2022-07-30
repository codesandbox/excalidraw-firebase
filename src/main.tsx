import React from "react";
import ReactDOM from "react-dom";
import { DevtoolsProvider } from "react-states/devtools";
import "./index.css";
import { Pages } from "./pages";

import { EnvironmentProvider } from "./environment-interface";
import { createBrowserEnvironment } from "./environment-interface/browser";
import { Provider as HooksProvider } from "./hooks";

// Polyfill for Loom
if (typeof (window as any).global === "undefined") {
  (window as any).global = window;
}

const environment = createBrowserEnvironment();

const App = () => {
  return (
    <EnvironmentProvider environment={environment}>
      <HooksProvider>
        <Pages />
      </HooksProvider>
    </EnvironmentProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    {import.meta.env.PROD ? (
      <App />
    ) : (
      <DevtoolsProvider>
        <App />
      </DevtoolsProvider>
    )}
  </React.StrictMode>,
  document.getElementById("root")
);
