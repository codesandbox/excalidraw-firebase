import React, { createContext, useReducer } from "react";
import {
  createReducer,
  States,
  StatesTransition,
  useStateEffect,
  useSubsription,
} from "react-states";

import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { AuthenticationAction, User } from "../../environment/authentication";

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

export type PublicAction = {
  type: "SIGN_IN";
};

export type PublicFeature = States<State, PublicAction>;

export type Feature = States<State, PublicAction | AuthenticationAction>;

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
  const feature = useReducer(reducer, initialState);

  if (process.env.NODE_ENV === "development") {
    useDevtools("auth", feature);
  }

  const [state, dispatch] = feature;

  useSubsription(authentication.subscription, dispatch);

  useStateEffect(state, "SIGNING_IN", () => authentication.signIn());

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
