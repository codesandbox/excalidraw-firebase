import { Emit } from "react-states";
import firebase from "firebase/app";
import {
  Authentication,
  AuthenticationEvent,
  User,
} from "../../environment-interface/authentication";

const USERS_COLLECTION = "users";
const CONFIG_COLLECTION = "config";
const API_KEYS_DOCUMENT = "apiKeys";

const getUser = (firebaseUser: firebase.User): User => ({
  uid: firebaseUser.uid,
  name: firebaseUser.email!.split("@")[0],
  avatarUrl: firebaseUser.providerData[0]?.photoURL ?? null,
});

const updateUserData = (user: User) => {
  /*
    We update the user document with name and avatarUrl so other
    users can see it as well
  */
  firebase.firestore().collection(USERS_COLLECTION).doc(user.uid).set(
    {
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
    {
      merge: true,
    }
  );
};

export const createAuthentication = (
  emit: Emit<AuthenticationEvent>
): Authentication => {
  firebase.auth().onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      const user = getUser(firebaseUser);
      updateUserData(user);
      firebase
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
    signIn: () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase
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
