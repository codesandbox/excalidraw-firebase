import React, { useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { getSceneVersion } from "@excalidraw/excalidraw";
import { PickState, match } from "react-states";
import { ExcalidrawCanvas } from "./ExcalidrawCanvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClipboard,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import {
  Excalidraw as ExcalidrawFeature,
  useExcalidraw,
} from "../../features/Excalidraw";

import { useRecording } from "../../features/Recording";

type EditExcalidrawState = PickState<
  ExcalidrawFeature,
  "LOADED" | "EDIT" | "SYNCING" | "DIRTY" | "SYNCING_DIRTY"
>;

const EditExcalidraw = ({ state }: { state: EditExcalidrawState }) => {
  const [_, dispatch] = useExcalidraw();
  const [recording, dispatchRecording] = useRecording();
  const [title, setTitle] = useState(state.metadata.title || "");

  const onChange = useMemo(
    () =>
      debounce((elements, appState) => {
        dispatch({
          type: "EXCALIDRAW_CHANGE",
          data: {
            elements,
            appState,
            version: getSceneVersion(elements),
          },
        });
      }, 100),
    []
  );

  const copyToClipboard = () => {
    dispatch({ type: "COPY_TO_CLIPBOARD" });
  };

  const variants = {
    default: () => ({
      className:
        "text-gray-500 bg-gray-50 hover:bg-gray-100 focus:ring-gray-50",
      content: <FontAwesomeIcon icon={faClipboard} size="lg" />,
      onClick: copyToClipboard,
    }),
    active: () => ({
      className:
        "text-green-500 bg-green-50 hover:bg-green-100 focus:ring-green-50",
      content: <FontAwesomeIcon icon={faClipboard} size="lg" />,
      onClick: undefined,
    }),
    loading: () => ({
      className:
        "opacity-50 text-gray-500 bg-gray-50 hover:bg-gray-100 focus:ring-gray-50",
      content: <div className="lds-dual-ring"></div>,
      onClick: undefined,
    }),
  };

  const variant = match(state, {
    DIRTY: variants.loading,
    LOADED: variants.loading,
    SYNCING: variants.loading,
    SYNCING_DIRTY: variants.loading,
    EDIT: () =>
      match(state.clipboard, {
        COPIED: variants.active,
        NOT_COPIED: variants.default,
      }),
  });

  const isRecordingDisabled = match(recording, {
    DISABLED: () => true,
    RECORDING: () => true,
    NOT_CONFIGURED: () => false,
    READY: () => false,
  });

  return (
    <div>
      <ExcalidrawCanvas
        data={state.data}
        onChange={onChange}
        readOnly={match(recording, {
          RECORDING: () => true,
          DISABLED: () => false,
          NOT_CONFIGURED: () => false,
          READY: () => false,
        })}
        onInitialized={() => {
          dispatch({ type: "INITIALIZE_CANVAS_SUCCESS" });
        }}
      />
      <div className="fixed z-50 right-16 top-2 flex items-center">
        <div className="relative rounded-md shadow-sm mr-3 w-64">
          <input
            autoComplete="off"
            autoCorrect="off"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 sm:text-sm border-gray-300 rounded-md h-10"
            placeholder="Title..."
          />
          {!title || title === state.metadata.title ? null : (
            <div
              className="absolute z-50 inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => {
                dispatch({
                  type: "SAVE_TITLE",
                  title,
                });
              }}
            >
              <FontAwesomeIcon icon={faCheck} size="sm" />
            </div>
          )}
        </div>
        <button
          id="loom-record"
          disabled={isRecordingDisabled}
          onClick={() => {
            dispatchRecording({
              type: "RECORD",
            });
          }}
          className={`${
            isRecordingDisabled
              ? "text-gray-500 bg-gray-200 hover:bg-red-100 focus:ring-red-100"
              : "text-white bg-red-500 hover:bg-red-400 focus:ring-red-400"
          } mr-3  ginline-flex items-center justify-center w-12 h-10 p-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          <FontAwesomeIcon icon={faVideo} size="lg" />
        </button>
        <button
          onClick={variant.onClick}
          className={`${variant.className} relative inline-flex items-center justify-center w-12 h-10 p-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          {variant.content}
        </button>
      </div>
    </div>
  );
};

export const Excalidraw = () => {
  const [excalidraw] = useExcalidraw();

  const renderExcalidraw = (state: EditExcalidrawState) => (
    <EditExcalidraw state={state} />
  );

  return match(excalidraw, {
    LOADING: () => (
      <div className="center-wrapper">
        <div className="lds-dual-ring"></div>
      </div>
    ),
    ERROR: ({ error }) => (
      <div className="center-wrapper">
        <h1>OMG, error, {error}</h1>
      </div>
    ),
    LOADED: renderExcalidraw,
    EDIT: renderExcalidraw,
    SYNCING: renderExcalidraw,
    DIRTY: renderExcalidraw,
    SYNCING_DIRTY: renderExcalidraw,
  });
};
