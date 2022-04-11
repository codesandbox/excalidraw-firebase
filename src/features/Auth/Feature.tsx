import React, { createContext } from "react";
import { States, StatesTransition, useStateEffect } from "react-states";

import {
  useEnvironment,
  createReducer,
  useReducer,
} from "../../environment-interface";
import { User } from "../../environment-interface/authentication";

export type State =
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

export type Action = {
  type: "SIGN_IN";
};

export type Feature = States<State, Action>;

export type Transition = StatesTransition<Feature>;

const featureContext = createContext({} as Feature);

export const useFeature = () => React.useContext(featureContext);

const reducer = createReducer<Feature>({
  CHECKING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED": (_, { user, loomApiKey }): Transition => ({
      state: "AUTHENTICATED",
      user,
      loomApiKey,
    }),
    "AUTHENTICATION:UNAUTHENTICATED": (): Transition => ({
      state: "UNAUTHENTICATED",
    }),
  },
  UNAUTHENTICATED: {
    SIGN_IN: (): Transition => ({ state: "SIGNING_IN" }),
  },
  SIGNING_IN: {
    "AUTHENTICATION:AUTHENTICATED": (_, { user, loomApiKey }): Transition => ({
      state: "AUTHENTICATED",
      user,
      loomApiKey,
    }),
    "AUTHENTICATION:SIGN_IN_ERROR": (_, { error }): Transition => ({
      state: "ERROR",
      error,
    }),
  },
  AUTHENTICATED: {},
  ERROR: {},
});

export const FeatureProvider = ({
  children,
  initialState = {
    state: "CHECKING_AUTHENTICATION",
  },
}: {
  children: React.ReactNode;
  initialState?: State;
}) => {
  const { authentication } = useEnvironment();
  const feature = useReducer("Authentication", reducer, initialState);

  const [state] = feature;

  useStateEffect(state, "SIGNING_IN", () => authentication.signIn());

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
