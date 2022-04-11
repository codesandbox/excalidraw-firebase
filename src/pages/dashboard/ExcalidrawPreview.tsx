import * as React from "react";
import { match, StatesTransition, useStateEffect, States } from "react-states";
import { ExcalidrawMetadata } from "../../environment-interface/storage";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import { Link } from "react-router-dom";
import {
  useEnvironment,
  createReducer,
  useReducer,
} from "../../environment-interface";
import { User } from "../../environment-interface/authentication";

type State =
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

type ExcalidrawPreview = States<State, any>;

type Transition = StatesTransition<ExcalidrawPreview>;

const excalidrawPreviewReducer = createReducer<ExcalidrawPreview>({
  LOADING_PREVIEW: {
    "STORAGE:IMAGE_SRC_SUCCESS": (state, { id, src }): Transition =>
      id === state.id
        ? {
            state: "PREVIEW_LOADED",
            src,
          }
        : state,
    "STORAGE:IMAGE_SRC_ERROR": (state, { id, error }): Transition =>
      state.id === id
        ? {
            state: "LOADING_ERROR",
            error,
          }
        : state,
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
  const [preview] = useReducer(
    `ExcalidrawPreview-${metadata.id}`,
    excalidrawPreviewReducer,
    {
      state: "LOADING_PREVIEW",
      id: metadata.id,
    }
  );

  useStateEffect(preview, "LOADING_PREVIEW", () => {
    storage.getImageSrc(user.uid, metadata.id);
  });

  const renderPreview = (background: string) => (
    <div className="w-full h-full" style={{ background }}></div>
  );

  return (
    <Link to={`/${user.uid}/${metadata.id}`}>
      <div className="relative rounded-lg group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-cyan-500">
        <div className="mb-2 flex items-center">
          {user.avatarUrl ? (
            <img
              className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 shadow-sm mr-3"
              src={user.avatarUrl}
              alt=""
            />
          ) : null}
          <h3 className="text-lg font-medium">
            <span className="absolute inset-0" aria-hidden="true" />
            {metadata.title || ""}
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
        <div className="absolute bottom-6 right-6 flex justify-between items-center">
          <span className="ml-auto bg-gray-200 text-gray-500 px-2 py-1 rounded-md z-10 h-8 flex items-center text-sm shadow-sm">
            {formatDistanceToNow(metadata.last_updated)} ago
          </span>
        </div>
      </div>
    </Link>
  );
};
