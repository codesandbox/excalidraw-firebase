import { err, ok, result } from "react-states";
import firebase from "firebase/app";
import { Auth, SignInError, User } from "./";

const getUser = (firebaseUser: firebase.User): User => ({
  uid: firebaseUser.uid,
  name: firebaseUser.email!.split("@")[0],
  avatarUrl: firebaseUser.providerData[0]?.photoURL ?? null,
});

export const auth: Auth = {
  signIn: () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const promise = firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) =>
        result.user ? ok(getUser(result.user)) : err("NOT_SIGNED_IN")
      )
      .catch((error: Error) => err("ERROR", error));

    return result<User, SignInError>(promise);
  },
  onAuthChange: (cb: (user: User | null) => void) => {
    return firebase.auth().onAuthStateChanged((firebaseUser) => {
      cb(firebaseUser ? getUser(firebaseUser) : null);
    });
  },
};
