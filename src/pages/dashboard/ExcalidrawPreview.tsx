import * as React from "react";
import { match, createReducer, useEnterEffect, useEvents } from "react-states";
import { ExcalidrawMetadata, StorageEvent } from "../../environment/storage";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import { Link } from "react-router-dom";
import { useEnvironment } from "../../environment";
import { User } from "../../environment/authentication";

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
  user,
  metadata,
}: {
  user: User;
  metadata: ExcalidrawMetadata;
}) => {
  const { storage } = useEnvironment();
  const [preview, send] = React.useReducer(excalidrawPreviewReducer, {
    state: "LOADING_PREVIEW",
    id: metadata.id,
  });

  useEvents(storage.events, send);

  useEnterEffect(preview, "LOADING_PREVIEW", () => {
    storage.getImageSrc(user.uid, metadata.id);
  });

  const renderPreview = (background: string) => (
    <div className="w-full h-full" style={{ background }}></div>
  );

  return (
    <Link to={`/${user.uid}/${metadata.id}`}>
      <div className="relative rounded-lg group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-cyan-500">
        <div className="mb-2">
          <h3 className="text-lg font-medium">
            <span className="absolute inset-0" aria-hidden="true" />
            {metadata.title || "No Title"}
          </h3>
        </div>
        <div className="relative h-32">
          {match(preview, {
            LOADING_PREVIEW: () => <div className="lds-dual-ring"></div>,
            PREVIEW_LOADED: ({ src }) =>
              renderPreview(`center / contain no-repeat url(${src})`),
            LOADING_ERROR: () => renderPreview("#FFF"),
          })}
        </div>
        <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-center">
          {user.avatarUrl ? (
            <img
              className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"
              src={user.avatarUrl}
              alt=""
            />
          ) : null}
          <span className="ml-auto bg-gray-200 text-gray-500 px-2 py-1 rounded-md z-10 h-8 flex items-center text-sm">
            {formatDistanceToNow(metadata.last_updated)} ago
          </span>
        </div>
      </div>
    </Link>
  );
};
