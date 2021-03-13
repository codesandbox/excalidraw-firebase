import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { ExcalidrawMetadata, User } from "../types";
import config from "../firebase.config.json";
import { Auth, ExcalidrawStorage } from "./interfaces";

firebase.initializeApp(config);

const EXCALIDRAWS_COLLECTION = "excalidraws";
const EXCALIDRAWS_DATA_COLLECTION = "excalidrawsData";
const USERS_COLLECTION = "users";

export const storage: ExcalidrawStorage = {
  createExcalidraw: (userId) =>
    firebase
      .firestore()
      .collection(USERS_COLLECTION)
      .doc(userId)
      .collection(EXCALIDRAWS_COLLECTION)
      .add({
        last_updated: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((ref) => ref.id),
  getExcalidraw(userId: string, id: string) {
    return Promise.all([
      firebase
        .firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .collection(EXCALIDRAWS_COLLECTION)
        .doc(id)
        .get(),
      firebase
        .firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .collection(EXCALIDRAWS_DATA_COLLECTION)
        .doc(id)
        .get(),
    ]).then(([metadataDoc, dataDoc]) => {
      const metadata = metadataDoc.data()!;
      const data = dataDoc.exists
        ? dataDoc.data()!
        : {
            elements: JSON.stringify([]),
            appState: JSON.stringify({
              viewBackgroundColor: "#FFF",
              currentItemFontFamily: 1,
            }),
            version: 0,
          };

      return {
        metadata: {
          ...(metadata as ExcalidrawMetadata),
          last_updated: metadata.last_updated.toDate() as Date,
        },
        data: {
          appState: JSON.parse(data.appState),
          elements: JSON.parse(data.elements),
          version: data.version,
        },
      };
    });
    //
  },
  saveExcalidraw: (userId, id, elements, appState) =>
    Promise.all([
      firebase
        .firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .collection(EXCALIDRAWS_DATA_COLLECTION)
        .doc(id)
        .set({
          elements: JSON.stringify(elements),
          appState: JSON.stringify({
            viewBackgroundColor: appState.viewBackgroundColor,
          }),
        }),
      firebase
        .firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .collection(EXCALIDRAWS_COLLECTION)
        .doc(id)
        .set(
          {
            last_updated: firebase.firestore.FieldValue.serverTimestamp(),
          },
          {
            merge: true,
          }
        ),
    ]).then(() => {}),
  saveImage: (userId, id, image) => {
    // Firebase has custom promises
    return new Promise((resolve, reject) => {
      firebase
        .storage()
        .ref()
        .child(`previews/${userId}/${id}`)
        .put(image)
        .then(() => resolve())
        .catch(reject);
    });
  },
  getPreviews: (userId) =>
    firebase
      .firestore()
      .collection(USERS_COLLECTION)
      .doc(userId)
      .collection(EXCALIDRAWS_COLLECTION)
      .orderBy("last_updated", "desc")
      .get()
      .then((collection) => {
        return collection.docs.map(
          (doc) =>
            ({
              id: doc.id,
              last_updated: doc.data().last_updated.toDate(),
            } as ExcalidrawMetadata)
        );
      }),
};

export const auth: Auth = {
  signIn: () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    return firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) =>
        result.user ? { uid: result.user.uid, email: result.user.email } : null
      );
  },
  onAuthChange: (cb: (user: User | null) => void) => {
    return firebase.auth().onAuthStateChanged(cb);
  },
};
