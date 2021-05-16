import React, { useReducer } from "react";
import {
  createContext,
  createHook,
  createReducer,
  useEnterEffect,
  useEvents,
} from "react-states";
import { ExcalidrawsByUser, StorageEvent } from "../../environment/storage";
import { useEnvironment } from "../../environment";
import { useDevtools } from "react-states/devtools";
import { useHistory } from "react-router";
import { useAuth } from "../Auth";

export type Context =
  | {
      state: "LOADING_PREVIEWS";
    }
  | {
      state: "PREVIEWS_LOADED";
      excalidraws: ExcalidrawsByUser;
    }
  | {
      state: "CREATING_EXCALIDRAW";
      excalidraws: ExcalidrawsByUser;
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
      excalidraws: ExcalidrawsByUser;
      error: string;
    };

export type UIEvent = {
  type: "CREATE_EXCALIDRAW";
};

export type Event = UIEvent | StorageEvent;

const reducer = createReducer<Context, Event>({
  LOADING_PREVIEWS: {
    "STORAGE:FETCH_PREVIEWS_SUCCESS": ({ excalidrawsByUser }) => ({
      state: "PREVIEWS_LOADED",
      excalidraws: excalidrawsByUser,
    }),
    "STORAGE:FETCH_PREVIEWS_ERROR": ({ error }) => ({
      state: "PREVIEWS_ERROR",
      error,
    }),
  },
  PREVIEWS_LOADED: {
    CREATE_EXCALIDRAW: (_, { excalidraws }) => ({
      state: "CREATING_EXCALIDRAW",
      excalidraws,
    }),
  },
  CREATING_EXCALIDRAW: {
    "STORAGE:CREATE_EXCALIDRAW_SUCCESS": ({ id }) => ({
      state: "EXCALIDRAW_CREATED",
      id,
    }),
    "STORAGE:CREATE_EXCALIDRAW_ERROR": ({ error }, { excalidraws }) => ({
      state: "CREATE_EXCALIDRAW_ERROR",
      error,
      excalidraws,
    }),
  },
  PREVIEWS_ERROR: {
    CREATE_EXCALIDRAW: () => ({
      state: "CREATING_EXCALIDRAW",
      excalidraws: {},
    }),
  },
  CREATE_EXCALIDRAW_ERROR: {
    CREATE_EXCALIDRAW: (_, { excalidraws }) => ({
      state: "CREATING_EXCALIDRAW",
      excalidraws,
    }),
  },
  EXCALIDRAW_CREATED: {},
});

const featureContext = createContext<Context, Event>();

export const useFeature = createHook(featureContext);

export const FeatureProvider = ({
  children,
  initialContext = {
    state: "LOADING_PREVIEWS",
  },
}: {
  children: React.ReactNode;
  initialContext?: Context;
}) => {
  const history = useHistory();
  const [auth] = useAuth("AUTHENTICATED");
  const { storage } = useEnvironment();
  const feature = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("dashboard", feature);
  }

  const [context, send] = feature;

  useEvents(storage.events, send);

  useEnterEffect(context, "LOADING_PREVIEWS", () => storage.fetchPreviews());

  useEnterEffect(context, "CREATING_EXCALIDRAW", () =>
    storage.createExcalidraw(auth.user.uid)
  );

  useEnterEffect(context, "EXCALIDRAW_CREATED", ({ id }) => {
    history.push(`/${auth.user.uid}/${id}`);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
