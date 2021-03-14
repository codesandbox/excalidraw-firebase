import React, { useEffect } from "react";
import { PickAction, States, useStates } from "react-states";
import { useExternals } from "../externals";

export type Context =
  | {
      state: "INITIALIZING";
    }
  | {
      state: "DASHBOARD";
      isUrlDispatch: boolean;
    }
  | {
      state: "EXCALIDRAW";
      isUrlDispatch: boolean;
      id: string;
      userId: string;
    };

export type Action =
  | {
      type: "OPEN_DASBHOARD";
      isUrlDispatch?: boolean;
    }
  | {
      type: "OPEN_EXCALIDRAW";
      isUrlDispatch?: boolean;
      userId: string;
      id: string;
    };

const navigationContext = React.createContext({} as States<Context, Action>);

export const useNavigation = () => React.useContext(navigationContext);

export const NavigationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { router } = useExternals();
  const navigation = useStates<Context, Action>(
    {
      INITIALIZING: {
        OPEN_DASBHOARD,
        OPEN_EXCALIDRAW,
      },
      DASHBOARD: {
        OPEN_EXCALIDRAW,
      },
      EXCALIDRAW: {
        OPEN_DASBHOARD,
        OPEN_EXCALIDRAW,
      },
    },
    {
      state: "INITIALIZING",
    }
  );

  useEffect(() => {
    router.on("/", function () {
      navigation.dispatch({ type: "OPEN_DASBHOARD", isUrlDispatch: true });
    });

    router.on<{ userId: string; id: string }>("/:userId/:id", (params) => {
      navigation.dispatch({
        type: "OPEN_EXCALIDRAW",
        isUrlDispatch: true,
        id: params.id,
        userId: params.userId,
      });
    });

    router.resolve();
  }, []);

  useEffect(
    () =>
      navigation.exec({
        DASHBOARD: ({ isUrlDispatch }) => {
          !isUrlDispatch && router.navigate(`/`);
        },
        EXCALIDRAW: ({ isUrlDispatch, userId, id }) => {
          !isUrlDispatch && router.navigate(`/${userId}/${id}`);
        },
      }),
    [navigation]
  );

  return (
    <navigationContext.Provider value={navigation}>
      {children}
    </navigationContext.Provider>
  );
};

function OPEN_EXCALIDRAW({
  id,
  userId,
  isUrlDispatch,
}: PickAction<Action, "OPEN_EXCALIDRAW">): Context {
  return {
    state: "EXCALIDRAW",
    id,
    userId,
    isUrlDispatch: Boolean(isUrlDispatch),
  };
}

function OPEN_DASBHOARD({
  isUrlDispatch,
}: PickAction<Action, "OPEN_DASBHOARD">): Context {
  return { state: "DASHBOARD", isUrlDispatch: Boolean(isUrlDispatch) };
}
