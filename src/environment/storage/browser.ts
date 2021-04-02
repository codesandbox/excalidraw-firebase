import firebase from "firebase/app";
import { ExcalidrawMetadata, ExcalidrawsByUser, Storage } from ".";
import { result } from "react-states";

const EXCALIDRAWS_COLLECTION = "excalidraws";
const EXCALIDRAWS_DATA_COLLECTION = "excalidrawsData";
const USERS_COLLECTION = "users";

export const createStorage = (): Storage => ({
  createExcalidraw: (userId) =>
    result((ok, err) =>
      firebase
        .firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .collection(EXCALIDRAWS_COLLECTION)
        .add({
          last_updated: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then((ref) => ok(ref.id))
        .catch((error: Error) => err("ERROR", error.message))
    ),
  hasExcalidrawUpdated: (userId, id, currentLastUpdated) =>
    result((ok, err) =>
      firebase
        .firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .collection(EXCALIDRAWS_COLLECTION)
        .doc(id)
        .get()
        .then((doc) => {
          const data = doc.data() as any;

          return ok(
            data.last_updated.toDate().getTime() !==
              currentLastUpdated.getTime()
          );
        })
        .catch((error: Error) => err("ERROR", error.message))
    ),
  getExcalidraw(userId: string, id: string) {
    return result((ok, err) =>
      Promise.all([
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
      ])
        .then(([metadataDoc, dataDoc]) => {
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

          return ok({
            metadata: {
              ...(metadata as ExcalidrawMetadata),
              last_updated: metadata.last_updated.toDate() as Date,
            },
            data: {
              appState: JSON.parse(data.appState),
              elements: JSON.parse(data.elements),
              version: data.version,
            },
          });
        })
        .catch((error: Error) => err("ERROR", error.message))
    );
  },
  saveExcalidraw: (userId, id, elements, appState) =>
    result((ok, err) =>
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
      ])
        .then(() =>
          firebase
            .firestore()
            .collection(USERS_COLLECTION)
            .doc(userId)
            .collection(EXCALIDRAWS_COLLECTION)
            .doc(id)
            .get()
            .then((doc) => {
              const metadata = doc.data()!;

              return ok({
                ...(metadata as ExcalidrawMetadata),
                last_updated: metadata.last_updated.toDate() as Date,
              });
            })
        )
        .catch((error: Error) => err("ERROR", error.message))
    ),
  saveImage: (userId, id, image) => {
    return result((ok, err) =>
      firebase
        .storage()
        .ref()
        .child(`previews/${userId}/${id}`)
        .put(image)
        .then(() => ok(undefined))
        .catch((error: Error) => err("ERROR", error.message))
    );
  },
  getPreviews: () =>
    result((ok, err) =>
      firebase
        .firestore()
        .collection(USERS_COLLECTION)
        .get()
        .then((collection) =>
          Promise.all(
            collection.docs.map((userDoc) =>
              firebase
                .firestore()
                .collection(USERS_COLLECTION)
                .doc(userDoc.id)
                .collection(EXCALIDRAWS_COLLECTION)
                .orderBy("last_updated", "desc")
                .limit(5)
                .get()
                .then((collection) => {
                  return {
                    id: userDoc.id,
                    name: userDoc.data().name,
                    avatarUrl: userDoc.data().avatarUrl,
                    excalidraws: collection.docs.map(
                      (doc) =>
                        ({
                          id: doc.id,
                          author: userDoc.id,
                          last_updated: doc.data().last_updated.toDate(),
                        } as ExcalidrawMetadata)
                    ),
                  };
                })
            )
          )
        )
        .then((users) =>
          ok(
            users.reduce<ExcalidrawsByUser>((aggr, user) => {
              aggr[user.id] = {
                name: user.name,
                avatarUrl: user.avatarUrl,
                excalidraws: user.excalidraws,
              };

              return aggr;
            }, {})
          )
        )
        .catch((error: Error) => err("ERROR", error.message))
    ),
  getImageSrc: (userId, id) =>
    result((ok, err) =>
      firebase
        .storage()
        .ref()
        .child(`previews/${userId}/${id}`)
        .getDownloadURL()
        .then((src) => {
          return ok(src);
        })
        .catch((error: Error) => {
          return err("ERROR", error.message);
        })
    ),
});
