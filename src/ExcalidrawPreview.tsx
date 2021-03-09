import * as React from "react";
import { useStates } from "react-states";
import firebase from "firebase/app";
import {
  EXCALIDRAWS_COLLECTION,
  EXCALIDRAW_PREVIEWS_COLLECTION,
  USERS_COLLECTION,
} from "./constants";
import { useAuthenticatedAuth } from "./AuthProvider";
import { useNavigation } from "./NavigationProvider";

type Context =
  | {
      state: "LOADING_PREVIEW";
    }
  | {
      state: "PREVIEW_LOADED";
      src: string;
    }
  | {
      state: "LOADING_ERROR";
      error: string;
    };

type Action =
  | {
      type: "LOADING_PREVIEW_SUCCESS";
      src: string;
    }
  | {
      type: "LOADING_PREVIEW_ERROR";
      error: string;
    };

export const ExcalidrawPreview = ({ id }: { id: string }) => {
  const auth = useAuthenticatedAuth();
  const navigation = useNavigation();
  const preview = useStates<Context, Action>(
    {
      LOADING_PREVIEW: {
        LOADING_PREVIEW_SUCCESS: ({ src }) => ({
          state: "PREVIEW_LOADED",
          src,
        }),
        LOADING_PREVIEW_ERROR: ({ error }) => ({
          state: "LOADING_ERROR",
          error,
        }),
      },
      PREVIEW_LOADED: {},
      LOADING_ERROR: {},
    },
    {
      state: "LOADING_PREVIEW",
    }
  );

  React.useEffect(
    () =>
      preview.exec({
        LOADING_PREVIEW: () => {
          firebase
            .firestore()
            .collection(USERS_COLLECTION)
            .doc(auth.context.user.uid)
            .collection(EXCALIDRAW_PREVIEWS_COLLECTION)
            .doc(id)
            .get()
            .then((doc) => {
              if (doc.exists) {
                preview.dispatch({
                  type: "LOADING_PREVIEW_SUCCESS",
                  src: doc.data()!.src,
                });
              } else {
                preview.dispatch({
                  type: "LOADING_PREVIEW_ERROR",
                  error: "Preview does not exist",
                });
              }
            })
            .catch((error) => {
              preview.dispatch({
                type: "LOADING_PREVIEW_ERROR",
                error: error.message,
              });
            });
        },
      }),
    [preview]
  );

  return preview.transform({
    LOADING_PREVIEW: () => <li>"...loading..."</li>,
    PREVIEW_LOADED: ({ src }) => (
      <li
        style={{ backgroundImage: `url(${src})`, cursor: "pointer" }}
        onClick={() => {
          navigation.navigate(`/${auth.context.user.uid}/${id}`);
        }}
      />
    ),
    LOADING_ERROR: ({ error }) => <li style={{ color: "tomato" }}>{error}</li>,
  });
};
