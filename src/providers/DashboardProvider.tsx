import React, { useEffect } from "react";
import firebase from "firebase/app";
import { States, useStates } from "react-states";
import { EXCALIDRAWS_COLLECTION, USERS_COLLECTION } from "../constants";
import { useAuthenticatedAuth } from "./AuthProvider";
import { useRouter } from "./RouterProvider";
import { ExcalidrawMetaData } from "../types";

export type Context =
  | {
      state: "LOADING_PREVIEWS";
    }
  | {
      state: "PREVIEWS_LOADED";
      excalidraws: ExcalidrawMetaData[];
      showCount: number;
    }
  | {
      state: "CREATING_EXCALIDRAW";
      excalidraws: ExcalidrawMetaData[];
      showCount: number;
    }
  | {
      state: "EXCALIDRAW_CREATED";
      id: string;
    }
  | {
      state: "PREVIEWS_ERROR";
      error: string;
    }
  | {
      state: "CREATE_EXCALIDRAW_ERROR";
      excalidraws: ExcalidrawMetaData[];
      showCount: number;
      error: string;
    };

export type Action =
  | {
      type: "CREATE_EXCALIDRAW";
    }
  | {
      type: "CREATE_EXCALIDRAW_SUCCESS";
      id: string;
    }
  | {
      type: "CREATE_EXCALIDRAW_ERROR";
      error: string;
    }
  | {
      type: "LOADING_PREVIEWS_SUCCESS";
      excalidraws: ExcalidrawMetaData[];
    }
  | {
      type: "LOADING_PREVIEWS_ERROR";
      error: string;
    };

const context = React.createContext({} as States<Context, Action>);

export const useDashboard = () => React.useContext(context);

export const DashboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const auth = useAuthenticatedAuth();
  const router = useRouter();
  const dashboard = useStates<Context, Action>(
    {
      LOADING_PREVIEWS: {
        LOADING_PREVIEWS_SUCCESS: ({ excalidraws }) => ({
          state: "PREVIEWS_LOADED",
          excalidraws,
          showCount: 10,
        }),
        LOADING_PREVIEWS_ERROR: ({ error }) => ({
          state: "PREVIEWS_ERROR",
          error,
        }),
      },
      PREVIEWS_LOADED: {
        CREATE_EXCALIDRAW: (_, { excalidraws, showCount }) => ({
          state: "CREATING_EXCALIDRAW",
          excalidraws,
          showCount,
        }),
      },
      CREATING_EXCALIDRAW: {
        CREATE_EXCALIDRAW_SUCCESS: ({ id }) => ({
          state: "EXCALIDRAW_CREATED",
          id,
        }),
        CREATE_EXCALIDRAW_ERROR: ({ error }, { excalidraws, showCount }) => ({
          state: "CREATE_EXCALIDRAW_ERROR",
          error,
          excalidraws,
          showCount,
        }),
      },
      PREVIEWS_ERROR: {
        CREATE_EXCALIDRAW: () => ({
          state: "CREATING_EXCALIDRAW",
          excalidraws: [],
          showCount: 0,
        }),
      },
      CREATE_EXCALIDRAW_ERROR: {
        CREATE_EXCALIDRAW: (_, { excalidraws, showCount }) => ({
          state: "CREATING_EXCALIDRAW",
          excalidraws,
          showCount,
        }),
      },
      EXCALIDRAW_CREATED: {},
    },
    {
      state: "LOADING_PREVIEWS",
    }
  );

  useEffect(
    () =>
      dashboard.exec({
        LOADING_PREVIEWS: () => {
          firebase
            .firestore()
            .collection(USERS_COLLECTION)
            .doc(auth.context.user.uid)
            .collection(EXCALIDRAWS_COLLECTION)
            .orderBy("last_updated", "desc")
            .get()
            .then((collection) => {
              dashboard.dispatch({
                type: "LOADING_PREVIEWS_SUCCESS",
                excalidraws: collection.docs.map(
                  (doc) => ({ ...doc.data(), id: doc.id } as ExcalidrawMetaData)
                ),
              });
            })
            .catch((error) => {
              dashboard.dispatch({
                type: "LOADING_PREVIEWS_ERROR",
                error: error.message,
              });
            });
        },
        CREATING_EXCALIDRAW: () => {
          firebase
            .firestore()
            .collection(USERS_COLLECTION)
            .doc(auth.context.user.uid)
            .collection(EXCALIDRAWS_COLLECTION)
            .add({
              author: auth.context.user.email,
              last_updated: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .then((ref) => {
              dashboard.dispatch({
                type: "CREATE_EXCALIDRAW_SUCCESS",
                id: ref.id,
              });
            })
            .catch((error) => {
              dashboard.dispatch({
                type: "CREATE_EXCALIDRAW_ERROR",
                error: error.message,
              });
            });
        },
        EXCALIDRAW_CREATED: ({ id }) => {
          router.navigate(`/${auth.context.user.uid}/${id}`);
        },
      }),
    [dashboard]
  );

  return <context.Provider value={dashboard}>{children}</context.Provider>;
};
