import React, { useEffect } from "react";
import { PickAction, useStates } from "react-states";
import { Dashboard } from "./Dashboard";
import { DashboardProvider } from "../providers/DashboardProvider";
import { Excalidraw } from "./Excalidraw";
import { ExcalidrawProvider } from "../providers/ExcalidrawProvider";
import { useRouter } from "../providers/RouterProvider";

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
  const router = useRouter();
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

  return navigation.transform({
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
