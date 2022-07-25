import firebase from "firebase/app";
import { createEmitter } from "react-environment-interface";
import { Authentication, AuthenticationEvent, User } from ".";

const USERS_COLLECTION = "users";
const CONFIG_COLLECTION = "config";
const API_KEYS_DOCUMENT = "apiKeys";

const getUser = (firebaseUser: firebase.User): User => ({
  uid: firebaseUser.uid,
  name: firebaseUser.email!.split("@")[0],
  avatarUrl: firebaseUser.providerData[0]?.photoURL ?? null,
});

export const createAuthentication = (app: firebase.app.App): Authentication => {
  const { emit, subscribe } = createEmitter<AuthenticationEvent>();

  app.auth().onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      const user = getUser(firebaseUser);

      /*
        We update the user document with name and avatarUrl so other
        users can see it as well
      */
      app.firestore().collection(USERS_COLLECTION).doc(user.uid).set(
        {
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        {
          merge: true,
        }
      );

      app
        .firestore()
        .collection(CONFIG_COLLECTION)
        .doc(API_KEYS_DOCUMENT)
        .get()
        .then((doc) => {
          const data = doc.data();
          emit({
            type: "AUTHENTICATION:AUTHENTICATED",
            user,
            loomApiKey: data?.loom ?? null,
          });
        });
    } else {
      emit({
        type: "AUTHENTICATION:UNAUTHENTICATED",
      });
    }
  });

  return {
    emit,
    subscribe,
    signIn: () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      app
        .auth()
        .signInWithPopup(provider)
        .catch((error: Error) => {
          emit({
            type: "AUTHENTICATION:SIGN_IN_ERROR",
            error: error.message,
          });
        });
    },
  };
};
