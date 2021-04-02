import { result } from "react-states";
import firebase from "firebase/app";
import { Auth, User } from ".";

const USERS_COLLECTION = "users";

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

export const createAuth = (): Auth => ({
  signIn: () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    return result((ok, err) =>
      firebase
        .auth()
        .signInWithPopup(provider)
        .then((result) => {
          if (result.user) {
            const user = getUser(result.user);

            updateUserData(user);

            return ok(user);
          }

          return err("NOT_SIGNED_IN");
        })
        .catch((error: Error) => err("ERROR", error))
    );
  },
  onAuthChange: (cb: (user: User | null) => void) => {
    return firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const user = getUser(firebaseUser);
        updateUserData(user);
        cb(user);
      } else {
        cb(null);
      }
    });
  },
});
