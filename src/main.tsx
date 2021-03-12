import React from "react";
import ReactDOM from "react-dom";
import config from "./firebase.config.json";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "./index.css";
import { Auth } from "./components/Auth";
import { AuthProvider } from "./providers/AuthProvider";
import { RouterProvider } from "./providers/RouterProvider";
import Navigo from "navigo";

firebase.initializeApp(config);

const router = new Navigo("/");

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider
        router={{
          on: (url, cb) => {
            router.on(url, ({ data }) => cb(data || ({} as any)));
          },
          resolve: () => router.resolve(),
          navigate: (url) => router.navigate(url),
        }}
      >
        <Auth />
      </RouterProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
