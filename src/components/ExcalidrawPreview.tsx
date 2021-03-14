import * as React from "react";
import { useStates } from "react-states";
import firebase from "firebase/app";
import { useAuthenticatedAuth } from "../features/Auth";
import { ExcalidrawMetadata } from "../types";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { useExternals } from "../externals";

type Context =
  | {
      state: "LOADING_PREVIEW";
    }
  | {
      state: "PREVIEW_LOADED";
      src: string;
    }
  | {
      state: "LOADING_ERROR";
      error: string;
    };

type Action =
  | {
      type: "LOADING_PREVIEW_SUCCESS";
      src: string;
    }
  | {
      type: "LOADING_PREVIEW_ERROR";
      error: string;
    };

export const ExcalidrawPreview = ({
  metadata,
}: {
  metadata: ExcalidrawMetadata;
}) => {
  const auth = useAuthenticatedAuth();
  const { router } = useExternals();
  const preview = useStates<Context, Action>(
    {
      LOADING_PREVIEW: {
        LOADING_PREVIEW_SUCCESS: ({ src }) => ({
          state: "PREVIEW_LOADED",
          src,
        }),
        LOADING_PREVIEW_ERROR: ({ error }) => ({
          state: "LOADING_ERROR",
          error,
        }),
      },
      PREVIEW_LOADED: {},
      LOADING_ERROR: {},
    },
    {
      state: "LOADING_PREVIEW",
    }
  );

  React.useEffect(
    () =>
      preview.exec({
        LOADING_PREVIEW: () => {
          firebase
            .storage()
            .ref()
            .child(`previews/${auth.context.user.uid}/${metadata.id}`)
            .getDownloadURL()
            .then((src) => {
              preview.dispatch({
                type: "LOADING_PREVIEW_SUCCESS",
                src,
              });
            })
            .catch((error) => {
              preview.dispatch({
                type: "LOADING_PREVIEW_ERROR",
                error: error.message,
              });
            });
        },
      }),
    [preview]
  );

  return preview.map({
    LOADING_PREVIEW: () => <li>"...loading..."</li>,
    PREVIEW_LOADED: ({ src }) => (
      <li
        style={{ backgroundImage: `url(${src})`, cursor: "pointer" }}
        onClick={() => {
          router.navigate(`/${auth.context.user.uid}/${metadata.id}`);
        }}
      >
        <span
          style={{
            backgroundColor: "#333",
            color: "#EAEAEA",
            padding: "0.25rem 0.5rem",
            borderRadius: "3px",
          }}
        >
          {formatDistanceToNow(metadata.last_updated)} ago
        </span>
      </li>
    ),
    LOADING_ERROR: ({ error }) => (
      <li
        style={{ color: "tomato", overflow: "hidden" }}
        onClick={() => {
          router.navigate(`/${auth.context.user.uid}/${metadata.id}`);
        }}
      >
        {error}
      </li>
    ),
  });
};
