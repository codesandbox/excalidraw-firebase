import * as React from "react";
import { match, createReducer, useEnterEffect, useEvents } from "react-states";
import { ExcalidrawMetadata, StorageEvent } from "../../environment/storage";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { styled } from "../../stitches.config";
import { Link } from "react-router-dom";
import { useEnvironment } from "../../environment";

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
      id: string;
    }
  | {
      state: "PREVIEW_LOADED";
      src: string;
    }
  | {
      state: "LOADING_ERROR";
      error: string;
    };

type ExcalidrawPreviewEvent = StorageEvent;

const excalidrawPreviewReducer = createReducer<
  ExcalidrawPreviewContext,
  ExcalidrawPreviewEvent
>({
  LOADING_PREVIEW: {
    "STORAGE:IMAGE_SRC_SUCCESS": ({ id, src }, context) =>
      id === context.id
        ? {
            state: "PREVIEW_LOADED",
            id,
            src,
          }
        : context,
    "STORAGE:IMAGE_SRC_ERROR": ({ id, error }, context) =>
      context.id === id
        ? {
            state: "LOADING_ERROR",
            id,
            error,
          }
        : context,
  },
  PREVIEW_LOADED: {},
  LOADING_ERROR: {},
});

export const ExcalidrawPreview = ({
  userId,
  metadata,
}: {
  userId: string;
  metadata: ExcalidrawMetadata;
}) => {
  const { storage } = useEnvironment();
  const [preview, send] = React.useReducer(excalidrawPreviewReducer, {
    state: "LOADING_PREVIEW",
    id: metadata.id,
  });

  useEvents(storage.events, send);

  useEnterEffect(preview, "LOADING_PREVIEW", () => {
    storage.getImageSrc(userId, metadata.id);
  });

  const renderPreview = (background: string) => (
    <Wrapper style={{ background, cursor: "pointer" }}>
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
  );

  return match(preview, {
    LOADING_PREVIEW: () => (
      <Wrapper>
        <div className="lds-dual-ring"></div>
      </Wrapper>
    ),
    PREVIEW_LOADED: ({ src }) =>
      renderPreview(`center / contain no-repeat url(${src})`),
    LOADING_ERROR: () => renderPreview("#FFF"),
  });
};
