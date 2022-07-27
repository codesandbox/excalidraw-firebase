import firebase from "firebase/app";
import {
  ExcalidrawData,
  ExcalidrawMetadata,
  ExcalidrawPreview,
  Storage,
  StorageEvent,
} from ".";
import { exportToBlob, getSceneVersion } from "@excalidraw/excalidraw";

import { subMonths } from "date-fns";
import { createEmitter } from "react-environment-interface";

export const createExcalidrawImage = (
  elements: readonly any[],
  appState: any
) =>
  exportToBlob({
    elements: elements.filter((element) => !element.isDeleted),
    appState,
    files: null,
  });

const EXCALIDRAWS_COLLECTION = "excalidraws";
const EXCALIDRAWS_DATA_COLLECTION = "excalidrawsData";
const USERS_COLLECTION = "users";

export const createStorage = (app: firebase.app.App): Storage => {
  const { subscribe, emit } = createEmitter<StorageEvent>();

  const excalidrawSnapshotSubscriptions: {
    [id: string]: () => void;
  } = {};

  const lastSavedVersions: {
    [id: string]: number;
  } = {};

  function getUserExcalidraws(
    {
      id,
      name,
      avatarUrl,
    }: {
      id: string;
      name: string;
      avatarUrl: string;
    },
    since: Date
  ) {
    return app
      .firestore()
      .collection(USERS_COLLECTION)
      .doc(id)
      .collection(EXCALIDRAWS_COLLECTION)
      .where("last_updated", ">", since)
      .orderBy("last_updated", "desc")
      .get()
      .then((collection): ExcalidrawPreview[] => {
        return collection.docs.map((doc) => {
          const data = doc.data();

          return {
            user: {
              uid: id,
              name,
              avatarUrl,
            },
            metadata: {
              id: doc.id,
              title: data.title,
              last_updated: data.last_updated.toDate(),
              author: id,
            },
          };
        });
      });
  }

  function sortExcalidrawPreviews(a: ExcalidrawPreview, b: ExcalidrawPreview) {
    if (a.metadata.last_updated.getTime() > b.metadata.last_updated.getTime()) {
      return -1;
    } else if (
      a.metadata.last_updated.getTime() < b.metadata.last_updated.getTime()
    ) {
      return 1;
    }

    return 0;
  }

  return {
    subscribe,
    emit,
    createExcalidraw(userId) {
      app
        .firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .collection(EXCALIDRAWS_COLLECTION)
        .add({
          last_updated: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then((ref) => {
          emit({
            type: "STORAGE:CREATE_EXCALIDRAW_SUCCESS",
            id: ref.id,
          });
        })
        .catch((error: Error) => {
          emit({
            type: "STORAGE:CREATE_EXCALIDRAW_ERROR",
            error: error.message,
          });
        });
    },
    fetchExcalidraw(userId: string, id: string) {
      Promise.all([
        app
          .firestore()
          .collection(USERS_COLLECTION)
          .doc(userId)
          .collection(EXCALIDRAWS_COLLECTION)
          .doc(id)
          .get(),
        app
          .firestore()
          .collection(USERS_COLLECTION)
          .doc(userId)
          .collection(EXCALIDRAWS_DATA_COLLECTION)
          .doc(id)
          .get(),
      ])
        .then(([metadataDoc, dataDoc]) => {
          const metadata = {
            ...metadataDoc.data(),
            id,
          } as any;
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
              id,
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
            (image) =>
              image
                ? {
                    image,
                    metadata,
                    data,
                  }
                : Promise.reject("No image")
          );
        })
        .then(({ data, image, metadata }) => {
          emit({
            type: "STORAGE:FETCH_EXCALIDRAW_SUCCESS",
            metadata,
            data,
            image,
          });

          if (!excalidrawSnapshotSubscriptions[id]) {
            excalidrawSnapshotSubscriptions[id] = app
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

                if (lastSavedVersions[id] !== data.version) {
                  lastSavedVersions[id] = data.version;
                  emit({
                    type: "STORAGE:EXCALIDRAW_DATA_UPDATE",
                    id,
                    data: {
                      appState: JSON.parse(data.appState),
                      elements: JSON.parse(data.elements),
                      version: data.version,
                    },
                  });
                }
              });
          }
        })
        .catch((error: Error) => {
          emit({
            type: "STORAGE:FETCH_EXCALIDRAW_ERROR",
            error: error.message,
          });
        });
    },
    saveExcalidraw(userId, id, data) {
      const dataDoc = app
        .firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .collection(EXCALIDRAWS_DATA_COLLECTION)
        .doc(id);

      app
        .firestore()
        .runTransaction((transaction) => {
          return transaction.get(dataDoc).then((existingDoc) => {
            if (existingDoc.exists) {
              const existingData = existingDoc.data()!;
              const parsedData: ExcalidrawData = {
                appState: JSON.parse(existingData.appState),
                elements: JSON.parse(existingData.elements),
                version: existingData.version,
              };

              const newSceneVersion = getSceneVersion(data.elements);
              const currentSceneVersion = parsedData.version;

              if (newSceneVersion > currentSceneVersion) {
                transaction.update(dataDoc, {
                  elements: JSON.stringify(data.elements),
                  appState: JSON.stringify({
                    viewBackgroundColor: data.appState.viewBackgroundColor,
                  }),
                  version: data.version,
                });
                lastSavedVersions[id] = data.version;
              } else {
                return Promise.reject("NEWER_VERSION");
              }
            } else {
              transaction.set(dataDoc, {
                elements: JSON.stringify(data.elements),
                appState: JSON.stringify({
                  viewBackgroundColor: data.appState.viewBackgroundColor,
                }),
                version: data.version,
              });
              lastSavedVersions[id] = data.version;
            }
          });
        })
        .then(() =>
          app
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
            )
        )
        .then(() =>
          app
            .firestore()
            .collection(USERS_COLLECTION)
            .doc(userId)
            .collection(EXCALIDRAWS_COLLECTION)
            .doc(id)
            .get()
            .then((doc) => {
              const metadata = doc.data()!;

              return createExcalidrawImage(data.elements, data.appState).then(
                (image) =>
                  image
                    ? {
                        metadata,
                        image,
                      }
                    : Promise.reject("No image")
              );
            })
        )
        .then(({ metadata, image }) => {
          emit({
            type: "STORAGE:SAVE_EXCALIDRAW_SUCCESS",
            metadata: {
              ...(metadata as ExcalidrawMetadata),
              id,
              last_updated: metadata.last_updated.toDate() as Date,
            },
            image,
          });

          app.storage().ref().child(`previews/${userId}/${id}`).put(image);
        })
        .catch((error) => {
          if (error === "NEWER_VERSION") {
            emit({
              type: "STORAGE:SAVE_EXCALIDRAW_OLD_VERSION",
            });

            return;
          }

          emit({
            type: "STORAGE:SAVE_EXCALIDRAW_ERROR",
            error: error.message,
          });
        });
    },
    fetchPreviews() {
      return app
        .firestore()
        .collection(USERS_COLLECTION)
        .get()
        .then((collection) =>
          Promise.all(
            collection.docs.map((userDoc) =>
              getUserExcalidraws(
                {
                  id: userDoc.id,
                  avatarUrl: userDoc.data().avatarUrl,
                  name: userDoc.data().name,
                },
                subMonths(new Date(), 2)
              )
            )
          )
        )
        .then((excalidraws) => {
          return excalidraws
            .reduce<ExcalidrawPreview[]>(
              (aggr, userExcalidraws) => aggr.concat(userExcalidraws),
              []
            )
            .sort(sortExcalidrawPreviews);
        });
    },
    fetchUserPreviews(uid) {
      return app
        .firestore()
        .collection(USERS_COLLECTION)
        .doc(uid)
        .get()
        .then((userDoc) => {
          const data = userDoc.data();

          if (data) {
            return getUserExcalidraws(
              {
                id: uid,
                avatarUrl: data.avatarUrl,
                name: data.name,
              },
              subMonths(new Date(), 6)
            );
          }

          throw new Error("Invalid user");
        })
        .then((excalidraws) => {
          return excalidraws.sort(sortExcalidrawPreviews);
        });
    },
    getImageSrc(userId, id) {
      firebase
        .storage()
        .ref()
        .child(`previews/${userId}/${id}`)
        .getDownloadURL()
        .then((src) => {
          emit({
            type: "STORAGE:IMAGE_SRC_SUCCESS",
            id,
            src,
          });
        })
        .catch((error: Error) => {
          emit({
            type: "STORAGE:IMAGE_SRC_ERROR",
            id,
            error: error.message,
          });
        });
    },
    saveTitle(userId, id, title) {
      emit({
        type: "STORAGE:SAVE_TITLE_SUCCESS",
        id,
        title,
      });

      app
        .firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .collection(EXCALIDRAWS_COLLECTION)
        .doc(id)
        .set(
          {
            last_updated: firebase.firestore.FieldValue.serverTimestamp(),
            title,
          },
          {
            merge: true,
          }
        )
        .catch((error) => {
          emit({
            type: "STORAGE:SAVE_TITLE_ERROR",
            id,
            title,
            error: error.message,
          });
        });
    },
  };
};
