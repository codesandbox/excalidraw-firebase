import React, { useEffect } from "react";
import firebase from "firebase/app";
import { useStates } from "react-states";
import { EXCALIDRAWS_COLLECTION } from "./constants";
import { useAuthenticatedAuth } from "./AuthProvider";
import { useNavigation } from "./NavigationProvider";

type Context =
  | {
      state: "IDLE";
    }
  | {
      state: "CREATING_EXCALIDRAW";
    }
  | {
      state: "EXCALIDRAW_CREATED";
      id: string;
    }
  | {
      state: "ERROR";
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
    };

export const Dashboard = () => {
  const auth = useAuthenticatedAuth();
  const navigation = useNavigation();
  const dashboard = useStates<Context, Action>(
    {
      IDLE: {
        CREATE_EXCALIDRAW: () => ({ state: "CREATING_EXCALIDRAW" }),
      },
      CREATING_EXCALIDRAW: {
        CREATE_EXCALIDRAW_SUCCESS: ({ id }) => ({
          state: "EXCALIDRAW_CREATED",
          id,
        }),
        CREATE_EXCALIDRAW_ERROR: ({ error }) => ({ state: "ERROR", error }),
      },
      EXCALIDRAW_CREATED: {},
      ERROR: {
        CREATE_EXCALIDRAW: () => ({ state: "CREATING_EXCALIDRAW" }),
      },
    },
    {
      state: "IDLE",
    }
  );

  useEffect(
    () =>
      dashboard.exec({
        CREATING_EXCALIDRAW: () => {
          firebase
            .firestore()
            .collection(EXCALIDRAWS_COLLECTION)
            .add({
              elements: JSON.stringify([]),
              appState: JSON.stringify({
                viewBackgroundColor: "#FFF",
                currentItemFontFamily: 1,
              }),
              author: auth.context.user.email,
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
          navigation.navigate(`/${id}`);
        },
      }),
    [dashboard]
  );

  return (
    <div className="center-wrapper">
      <h1>Dashboard</h1>
      <button
        onClick={() => {
          dashboard.dispatch({ type: "CREATE_EXCALIDRAW" });
        }}
      >
        Create new Excalidraw
      </button>
    </div>
  );
};
