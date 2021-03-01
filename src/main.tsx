import React from "react";
import ReactDOM from "react-dom";
import config from "./firebase.config.json";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "./index.css";
import { Auth } from "./Auth";
import { AuthProvider } from "./AuthProvider";
import { NavigationProvider } from "./NavigationProvider";

firebase.initializeApp(config);

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <NavigationProvider>
        <Auth />
      </NavigationProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
