import config from "../firebase.config.json";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

import { createExcalidrawImage } from "./createExcalidrawImage/production";
import { storage } from "./storage/production";
import { onVisibilityChange } from "./onVisibilityChange/production";
import { auth } from "./auth/production";

firebase.initializeApp(config);

export { createExcalidrawImage, auth, storage, onVisibilityChange };
