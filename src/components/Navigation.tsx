import React, { useEffect } from "react";
import { PickAction, useStates } from "react-states";
import { Dashboard } from "./Dashboard";
import { DashboardProvider } from "../features/DashboardProvider";
import { Excalidraw } from "./Excalidraw";
import { ExcalidrawProvider } from "../features/ExcalidrawProvider";
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

const OPEN_EXCALIDRAW = ({
  id,
  userId,
}: PickAction<Action, "OPEN_EXCALIDRAW">) => ({
  state: "EXCALIDRAW" as const,
  id,
  userId,
});

const OPEN_DASBHOARD = () => ({ state: "DASHBOARD" as const });

export const Navigation = () => {
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

  return navigation.map({
    INITIALIZING: () => null,
    DASHBOARD: () => (
      <DashboardProvider>
        <Dashboard />
      </DashboardProvider>
    ),
    EXCALIDRAW: ({ id, userId }) => (
      <ExcalidrawProvider id={id} userId={userId}>
        <Excalidraw />
      </ExcalidrawProvider>
    ),
  });
};
