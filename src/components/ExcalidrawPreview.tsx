import * as React from "react";
import { useStates } from "react-states";
import firebase from "firebase/app";
import { useAuthenticatedAuth } from "../features/Auth";
import { ExcalidrawMetadata } from "../types";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { useNavigation } from "../features/Navigation";
import { styled } from "../stitches.config";

const Wrapper = styled("li", {
  borderRadius: "3px",
  border: "1px solid #eaeaea",
  display: "flex",
  margin: "1rem",
  padding: "1rem",
  alignItems: "center",
  justifyContent: "center",
  width: "200px",
  fontSize: "11px",
  height: "200px",
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  boxSizing: "border-box",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#fafafa ",
  },
});

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
  const navigation = useNavigation();
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
    LOADING_PREVIEW: () => (
      <Wrapper>
        <div className="lds-dual-ring"></div>
      </Wrapper>
    ),
    PREVIEW_LOADED: ({ src }) => (
      <Wrapper
        style={{ backgroundImage: `url(${src})`, cursor: "pointer" }}
        onClick={() => {
          navigation.dispatch({
            type: "OPEN_EXCALIDRAW",
            userId: auth.context.user.uid,
            id: metadata.id,
          });
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
      </Wrapper>
    ),
    LOADING_ERROR: ({ error }) => (
      <Wrapper
        style={{ color: "tomato", overflow: "hidden" }}
        onClick={() => {
          navigation.dispatch({
            type: "OPEN_EXCALIDRAW",
            userId: auth.context.user.uid,
            id: metadata.id,
          });
        }}
      >
        {error}
      </Wrapper>
    ),
  });
};
