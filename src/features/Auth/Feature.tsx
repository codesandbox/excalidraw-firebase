import React, { useReducer } from "react";
import {
  useEnterEffect,
  useEvents,
  createContext,
  createHook,
  createReducer,
} from "react-states";

import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { AuthenticationEvent, User } from "../../environment/authentication";

export type Context =
  | {
      state: "CHECKING_AUTHENTICATION";
    }
  | {
      state: "UNAUTHENTICATED";
    }
  | {
      state: "SIGNING_IN";
    }
  | {
      state: "AUTHENTICATED";
      user: User;
      loomApiKey: string | null;
    }
  | {
      state: "ERROR";
      error: string;
    };

export type UIEvent = {
  type: "SIGN_IN";
};

export type Event = UIEvent | AuthenticationEvent;

const featureContext = createContext<Context, UIEvent>();

export const useFeature = createHook(featureContext);

const reducer = createReducer<Context, Event>({
  CHECKING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED": ({ user, loomApiKey }) => ({
      state: "AUTHENTICATED",
      user,
      loomApiKey,
    }),
    "AUTHENTICATION:UNAUTHENTICATED": () => ({
      state: "UNAUTHENTICATED",
    }),
  },
  UNAUTHENTICATED: {
    SIGN_IN: () => ({ state: "SIGNING_IN" }),
  },
  SIGNING_IN: {
    "AUTHENTICATION:AUTHENTICATED": ({ user, loomApiKey }) => ({
      state: "AUTHENTICATED",
      user,
      loomApiKey,
    }),
    "AUTHENTICATION:SIGN_IN_ERROR": ({ error }) => ({
      state: "ERROR",
      error,
    }),
  },
  AUTHENTICATED: {},
  ERROR: {},
});

export const FeatureProvider = ({
  children,
  initialContext = {
    state: "CHECKING_AUTHENTICATION",
  },
}: {
  children: React.ReactNode;
  initialContext?: Context;
}) => {
  const { authentication } = useEnvironment();
  const feature = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development") {
    useDevtools("auth", feature);
  }

  const [context, send] = feature;

  useEvents(authentication.events, send);

  useEnterEffect(context, "SIGNING_IN", () => authentication.signIn());

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
