import React, { useEffect } from "react";
import firebase from "firebase/app";
import { useStates } from "react-states";
import { EXCALIDRAWS_COLLECTION, USERS_COLLECTION } from "./constants";
import { useAuthenticatedAuth } from "./AuthProvider";
import { useNavigation } from "./NavigationProvider";
import { ExcalidrawPreview } from "./ExcalidrawPreview";

type Context =
  | {
      state: "LOADING_PREVIEWS";
    }
  | {
      state: "PREVIEWS_LOADED";
      excalidrawIds: string[];
      showCount: number;
    }
  | {
      state: "CREATING_EXCALIDRAW";
      excalidrawIds: string[];
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
      excalidrawIds: string[];
      showCount: number;
      error: string;
    };

type Action =
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
      excalidrawIds: string[];
    }
  | {
      type: "LOADING_PREVIEWS_ERROR";
      error: string;
    };

export const Dashboard = () => {
  const auth = useAuthenticatedAuth();
  const navigation = useNavigation();
  const dashboard = useStates<Context, Action>(
    {
      LOADING_PREVIEWS: {
        LOADING_PREVIEWS_SUCCESS: ({ excalidrawIds }) => ({
          state: "PREVIEWS_LOADED",
          excalidrawIds,
          showCount: 10,
        }),
        LOADING_PREVIEWS_ERROR: ({ error }) => ({
          state: "PREVIEWS_ERROR",
          error,
        }),
      },
      PREVIEWS_LOADED: {
        CREATE_EXCALIDRAW: (_, { excalidrawIds, showCount }) => ({
          state: "CREATING_EXCALIDRAW",
          excalidrawIds,
          showCount,
        }),
      },
      CREATING_EXCALIDRAW: {
        CREATE_EXCALIDRAW_SUCCESS: ({ id }) => ({
          state: "EXCALIDRAW_CREATED",
          id,
        }),
        CREATE_EXCALIDRAW_ERROR: ({ error }, { excalidrawIds, showCount }) => ({
          state: "CREATE_EXCALIDRAW_ERROR",
          error,
          excalidrawIds,
          showCount,
        }),
      },
      PREVIEWS_ERROR: {
        CREATE_EXCALIDRAW: () => ({
          state: "CREATING_EXCALIDRAW",
          excalidrawIds: [],
          showCount: 0,
        }),
      },
      CREATE_EXCALIDRAW_ERROR: {
        CREATE_EXCALIDRAW: (_, { excalidrawIds, showCount }) => ({
          state: "CREATING_EXCALIDRAW",
          excalidrawIds,
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
                excalidrawIds: collection.docs.map((doc) => doc.id),
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
              elements: JSON.stringify([]),
              appState: JSON.stringify({
                viewBackgroundColor: "#FFF",
                currentItemFontFamily: 1,
              }),
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
          navigation.navigate(`/${auth.context.user.uid}/${id}`);
        },
      }),
    [dashboard]
  );

  const createExcalidraw = (
    <li
      className="create-new-excalidraw"
      onClick={() => {
        dashboard.dispatch({ type: "CREATE_EXCALIDRAW" });
      }}
    >
      Create new Excalidraw
    </li>
  );

  const previews =
    dashboard.context.state === "PREVIEWS_LOADED" ||
    dashboard.context.state === "CREATE_EXCALIDRAW_ERROR" ? (
      <ul>
        {createExcalidraw}
        {dashboard.context.excalidrawIds
          .slice(0, dashboard.context.showCount)
          .map((id) => (
            <ExcalidrawPreview key={id} id={id} />
          ))}
      </ul>
    ) : (
      <ul>{createExcalidraw}</ul>
    );

  return (
    <div className="center-wrapper">
      {dashboard.transform({
        CREATING_EXCALIDRAW: () => <h1>..creating Excalidraw...</h1>,
        PREVIEWS_ERROR: ({ error }) => (
          <>
            <p style={{ color: "tomato" }}>There was an error: {error}</p>
          </>
        ),
        CREATE_EXCALIDRAW_ERROR: ({ error }) => (
          <>
            <p style={{ color: "tomato" }}>There was an error: {error}</p>
            {previews}
          </>
        ),
        EXCALIDRAW_CREATED: () => <h1>...redirecting...</h1>,
        LOADING_PREVIEWS: () => <h1>...loading previews...</h1>,
        PREVIEWS_LOADED: () => previews,
      })}
    </div>
  );
};
