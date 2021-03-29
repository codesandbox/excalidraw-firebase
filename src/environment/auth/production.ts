import { err, ok, result } from "react-states";
import firebase from "firebase/app";
import { Auth, SignInError, User } from "./";

const USERS_COLLECTION = "users";

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
      .then((result) => {
        if (result.user) {
          const user = getUser(result.user);
          /*
            We update the user document with name and avatarUrl so other
            users can see it as well
          */
          firebase
            .firestore()
            .collection(USERS_COLLECTION)
            .doc(result.user.uid)
            .set(
              {
                name: user.name,
                avatarUrl: user.avatarUrl,
              },
              {
                merge: true,
              }
            );

          return ok(user);
        }

        return err("NOT_SIGNED_IN");
      })
      .catch((error: Error) => err("ERROR", error));

    return result<User, SignInError>(promise);
  },
  onAuthChange: (cb: (user: User | null) => void) => {
    return firebase.auth().onAuthStateChanged((firebaseUser) => {
      cb(firebaseUser ? getUser(firebaseUser) : null);
    });
  },
};
