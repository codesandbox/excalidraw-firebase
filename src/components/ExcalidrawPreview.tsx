import * as React from "react";
import { useStates } from "react-states";
import { useAuthenticatedAuth } from "../features/Auth";
import { ExcalidrawMetadata } from "../environment/storage";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { styled } from "../stitches.config";
import { Link } from "react-router-dom";
import { useEnvironment } from "../environment";

const Wrapper = styled("li", {
  position: "relative",
  borderRadius: "3px",
  border: "1px solid #eaeaea",
  display: "flex",
  margin: "1rem 1rem 0 0",
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

const WrapperLink = styled(Link, {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});

type ExcalidrawPreviewContext =
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

type ExcalidrawPreviewAction =
  | {
      type: "LOADING_PREVIEW_SUCCESS";
      src: string;
    }
  | {
      type: "LOADING_PREVIEW_ERROR";
      error: string;
    };

export const ExcalidrawPreview = ({
  userId,
  metadata,
}: {
  userId: string;
  metadata: ExcalidrawMetadata;
}) => {
  const { storage } = useEnvironment();

  const preview = useStates<ExcalidrawPreviewContext, ExcalidrawPreviewAction>(
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
          storage.getImageSrc(userId, metadata.id).resolve(
            (src) => {
              preview.dispatch({
                type: "LOADING_PREVIEW_SUCCESS",
                src,
              });
            },
            {
              ERROR: (error) => {
                preview.dispatch({
                  type: "LOADING_PREVIEW_ERROR",
                  error,
                });
              },
            }
          );
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
      <Wrapper style={{ backgroundImage: `url(${src})`, cursor: "pointer" }}>
        <WrapperLink to={`/${userId}/${metadata.id}`} />
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
      <Wrapper style={{ color: "tomato", overflow: "hidden" }}>{error}</Wrapper>
    ),
  });
};
