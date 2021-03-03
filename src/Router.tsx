import React, { useEffect, useReducer } from "react";
import { PickAction, transform, transition } from "react-states";
import { Dashboard } from "./Dashboard";
import { Excalidraw } from "./Excalidraw";
import { useNavigation } from "./NavigationProvider";

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
    };

export type Action =
  | {
      type: "OPEN_DASBHOARD";
    }
  | {
      type: "OPEN_EXCALIDRAW";
      id: string;
    }
  | {
      type: "DASHBOARD_NAVIGATED";
    }
  | {
      type: "EXCALIDRAW_NAVIGATED";
      id: string;
    };

export type RouterDispatch = React.Dispatch<Action>;

const OPEN_EXCALIDRAW = ({ id }: PickAction<Action, "OPEN_EXCALIDRAW">) => ({
  state: "EXCALIDRAW" as const,
  id,
});

const OPEN_DASBHOARD = () => ({ state: "DASHBOARD" as const });

export const Router = () => {
  const navigation = useNavigation();
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
    navigation.on("/", function () {
      dispatch({ type: "OPEN_DASBHOARD" });
    });

    navigation.on("/:id", function ({ data }) {
      dispatch({ type: "OPEN_EXCALIDRAW", id: data!.id });
    });

    navigation.resolve();
  }, []);

  return transform(context, {
    INITIALIZING: () => null,
    DASHBOARD: () => <Dashboard />,
    EXCALIDRAW: ({ id }) => <Excalidraw id={id} />,
  });
};
