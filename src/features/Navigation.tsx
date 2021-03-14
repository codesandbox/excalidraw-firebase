import React, { useEffect } from "react";
import { PickAction, States, useStates } from "react-states";
import { useExternals } from "../externals";

export type Context =
  | {
      state: "INITIALIZING";
    }
  | {
      state: "DASHBOARD";
    }
  | {
      state: "EXCALIDRAW";
      id: string;
      userId: string;
    };

export type Action =
  | {
      type: "OPEN_DASBHOARD";
    }
  | {
      type: "OPEN_EXCALIDRAW";
      userId: string;
      id: string;
    }
  | {
      type: "DASHBOARD_NAVIGATED";
    }
  | {
      type: "EXCALIDRAW_NAVIGATED";
      id: string;
    };

export type NavigationDispatch = React.Dispatch<Action>;

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
      navigation.dispatch({ type: "OPEN_DASBHOARD" });
    });

    router.on<{ userId: string; id: string }>("/:userId/:id", (params) => {
      navigation.dispatch({
        type: "OPEN_EXCALIDRAW",
        id: params.id,
        userId: params.userId,
      });
    });

    router.resolve();
  }, []);

  return (
    <navigationContext.Provider value={navigation}>
      {children}
    </navigationContext.Provider>
  );
};

function OPEN_EXCALIDRAW({
  id,
  userId,
}: PickAction<Action, "OPEN_EXCALIDRAW">) {
  return {
    state: "EXCALIDRAW" as const,
    id,
    userId,
  };
}

function OPEN_DASBHOARD() {
  return { state: "DASHBOARD" as const };
}
