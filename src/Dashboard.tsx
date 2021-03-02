import React, { useEffect, useReducer } from "react";
import firebase from "firebase/app";
import { exec, transition } from "react-states";
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
  const [authContext] = useAuthenticatedAuth();
  const navigation = useNavigation();
  const [context, dispatch] = useReducer(
    (context: Context, action: Action) =>
      transition(context, action, {
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
      }),
    {
      state: "IDLE",
    }
  );

  useEffect(
    () =>
      exec(context, {
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
              author: authContext.user.email,
            })
            .then((ref) => {
              dispatch({ type: "CREATE_EXCALIDRAW_SUCCESS", id: ref.id });
            })
            .catch((error) => {
              dispatch({
                type: "CREATE_EXCALIDRAW_ERROR",
                error: error.message,
              });
            });
        },
        EXCALIDRAW_CREATED: ({ id }) => {
          navigation.navigate(`/${id}`);
        },
      }),
    [context]
  );

  return (
    <div>
      <h1>Dashboard</h1>
      <button
        onClick={() => {
          dispatch({ type: "CREATE_EXCALIDRAW" });
        }}
      >
        Create new Excalidraw
      </button>
    </div>
  );
};
