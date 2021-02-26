import React, { useEffect, useMemo, useReducer } from "react";
import Navigo from "navigo";
import { transition, PickAction, transform, exec } from "react-states";
import { Dashboard } from "./Dashboard";
import { Excalidraw } from "./Excalidraw";

type Context =
  | {
      state: "INITIALIZING";
    }
  | {
      state: "DASHBOARD";
    }
  | {
      state: "EXCALIDRAW";
      id: string;
    };

type Action =
  | {
      type: "OPEN_DASBHOARD";
    }
  | {
      type: "OPEN_EXCALIDRAW";
      id: string;
    };

const OPEN_EXCALIDRAW = ({ id }: PickAction<Action, "OPEN_EXCALIDRAW">) => ({
  state: "EXCALIDRAW" as const,
  id,
});

const OPEN_DASBHOARD = () => ({ state: "DASHBOARD" as const });

export const Router = () => {
  const router = useMemo(() => new Navigo("/"), []);
  const [context, dispatch] = useReducer(
    (context: Context, action: Action) =>
      transition(context, action, {
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
      }),
    {
      state: "INITIALIZING",
    }
  );

  useEffect(() => {
    router.on("/", function () {
      dispatch({ type: "OPEN_DASBHOARD" });
    });

    router.on("/:id", function ({ data }) {
      dispatch({ type: "OPEN_EXCALIDRAW", id: data!.id });
    });

    router.resolve();
  }, []);

  return transform(context, {
    INITIALIZING: () => "Initializing...",
    DASHBOARD: () => <Dashboard />,
    EXCALIDRAW: ({ id }) => <Excalidraw id={id} />,
  });
};
