import firebase from "firebase/app";

export type ExcalidrawMetaData = {
  id: string;
  author: string;
  last_updated: firebase.firestore.Timestamp;
};

export type ExcalidrawData = {
  elements: any[];
  appState: any;
  version: number;
};
