import firebase from "firebase/app";
import {
  ExcalidrawData,
  ExcalidrawMetadata,
  ExcalidrawsByUser,
  Storage,
} from ".";
import { events, result } from "react-states";
import { exportToCanvas } from "./excalidraw-src/scene/export";
import { getChangedData } from "../../utils";

export const canvasToBlob = async (
  canvas: HTMLCanvasElement
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          return reject(new Error("Unable to create blob"));
        }
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const createExcalidrawImage = (elements: any[], appState: any) => {
  const canvas = exportToCanvas(
    elements.filter((element) => !element.isDeleted),
    appState,
    {
      exportBackground: true,
      shouldAddWatermark: false,
      viewBackgroundColor: "#FFF",
      exportPadding: 10,
      scale: 1,
    }
  );

  return canvasToBlob(canvas);
};

const EXCALIDRAWS_COLLECTION = "excalidraws";
const EXCALIDRAWS_DATA_COLLECTION = "excalidrawsData";
const USERS_COLLECTION = "users";

export const createStorage = (): Storage => {
  const excalidrawSnapshotSubscriptions: {
    [id: string]: () => void;
  } = {};
  return {
    events: events(),
    createExcalidraw(userId) {
      firebase
        .firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .collection(EXCALIDRAWS_COLLECTION)
        .add({
          last_updated: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then((ref) => {
          this.events.emit({
            type: "STORAGE:CREATE_EXCALIDRAW_SUCCESS",
            id: ref.id,
          });
        })
        .catch((error: Error) => {
          this.events.emit({
            type: "STORAGE:CREATE_EXCALIDRAW_ERROR",
            error: error.message,
          });
        });
    },
    fetchExcalidraw(userId: string, id: string) {
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
        })
        .then(({ metadata, data }) => {
          return createExcalidrawImage(data.elements, data.appState).then(
            (image) => ({
              image,
              metadata,
              data,
            })
          );
        })
        .then(({ data, image, metadata }) => {
          this.events.emit({
            type: "STORAGE:FETCH_EXCALIDRAW_SUCCESS",
            metadata,
            data,
            image,
          });

          if (!excalidrawSnapshotSubscriptions[id]) {
            excalidrawSnapshotSubscriptions[id] = firebase
              .firestore()
              .collection(USERS_COLLECTION)
              .doc(userId)
              .collection(EXCALIDRAWS_DATA_COLLECTION)
              .doc(id)
              .onSnapshot((doc) => {
                if (doc.metadata.hasPendingWrites) return;

                const data = doc.data();

                if (!data) {
                  return;
                }

                this.events.emit({
                  type: "STORAGE:EXCALIDRAW_DATA_UPDATE",
                  id,
                  data: {
                    appState: JSON.parse(data.appState),
                    elements: JSON.parse(data.elements),
                    version: data.version,
                  },
                });
              });
          }
        })
        .catch((error: Error) => {
          this.events.emit({
            type: "STORAGE:FETCH_EXCALIDRAW_ERROR",
            error: error.message,
          });
        });
    },
    saveExcalidraw(userId, id, data) {
      const dataDoc = firebase
        .firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .collection(EXCALIDRAWS_DATA_COLLECTION)
        .doc(id);

      Promise.all([
        firebase.firestore().runTransaction((transaction) => {
          return transaction.get(dataDoc).then((existingDoc) => {
            if (existingDoc.exists) {
              const existingData = existingDoc.data()!;
              const parsedData: ExcalidrawData = {
                appState: JSON.parse(existingData.appState),
                elements: JSON.parse(existingData.elements),
                version: existingData.version,
              };

              const changedData = getChangedData(data, parsedData) || data;

              transaction.update(dataDoc, {
                elements: JSON.stringify(changedData.elements),
                appState: JSON.stringify({
                  viewBackgroundColor: changedData.appState.viewBackgroundColor,
                }),
                version: changedData.version,
              });
            } else {
              transaction.set(dataDoc, {
                elements: JSON.stringify(data.elements),
                appState: JSON.stringify({
                  viewBackgroundColor: data.appState.viewBackgroundColor,
                }),
                version: data.version,
              });
            }
          });
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

              return createExcalidrawImage(data.elements, data.appState).then(
                (image) => ({
                  metadata,
                  image,
                })
              );
            })
        )
        .then(({ metadata, image }) => {
          this.events.emit({
            type: "STORAGE:SAVE_EXCALIDRAW_SUCCESS",
            metadata: {
              ...(metadata as ExcalidrawMetadata),
              last_updated: metadata.last_updated.toDate() as Date,
            },
            image,
          });

          firebase.storage().ref().child(`previews/${userId}/${id}`).put(image);
        })
        .catch((error: Error) => {
          this.events.emit({
            type: "STORAGE:SAVE_EXCALIDRAW_ERROR",
            error: error.message,
          });
        });
    },
    fetchPreviews() {
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
                .limit(10)
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
        .then((users) => {
          const excalidrawsByUser = users.reduce<ExcalidrawsByUser>(
            (aggr, user) => {
              aggr[user.id] = {
                name: user.name,
                avatarUrl: user.avatarUrl,
                excalidraws: user.excalidraws,
              };

              return aggr;
            },
            {}
          );
          this.events.emit({
            type: "STORAGE:FETCH_PREVIEWS_SUCCESS",
            excalidrawsByUser,
          });
        })
        .catch((error: Error) => {
          this.events.emit({
            type: "STORAGE:FETCH_PREVIEWS_ERROR",
            error: error.message,
          });
        });
    },
    getImageSrc(userId, id) {
      firebase
        .storage()
        .ref()
        .child(`previews/${userId}/${id}`)
        .getDownloadURL()
        .then((src) => {
          this.events.emit({
            type: "STORAGE:IMAGE_SRC_SUCCESS",
            id,
            src,
          });
        })
        .catch((error: Error) => {
          this.events.emit({
            type: "STORAGE:IMAGE_SRC_ERROR",
            id,
            error: error.message,
          });
        });
    },
  };
};
