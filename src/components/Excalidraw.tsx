import React, { useMemo } from "react";
import debounce from "lodash.debounce";
import { getSceneVersion } from "@excalidraw/excalidraw";
import { PickState, map } from "react-states";
import { ExcalidrawCanvas } from "./ExcalidrawCanvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { ExcalidrawContext, useExcalidraw } from "../features/Excalidraw";

type RenderExcalidrawContext = PickState<
  ExcalidrawContext,
  | "LOADED"
  | "EDIT"
  | "COPIED_TO_CLIPBOARD"
  | "SYNCING"
  | "DIRTY"
  | "SYNCING_DIRTY"
  | "UNFOCUSED"
  | "FOCUSED"
>;

export const Excalidraw = () => {
  const excalidraw = useExcalidraw();

  const onChange = useMemo(
    () =>
      debounce((elements, appState) => {
        excalidraw.dispatch({
          type: "EXCALIDRAW_CHANGE",
          elements,
          appState,
          version: getSceneVersion(elements),
        });
      }, 100),
    []
  );

  const renderExcalidraw = (context: RenderExcalidrawContext) => {
    const copyToClipboard = () => {
      excalidraw.dispatch({ type: "COPY_TO_CLIPBOARD" });
    };
    const variants = {
      default: () => ({
        style: undefined,
        content: <FontAwesomeIcon icon={faClipboard} />,
        onClick: copyToClipboard,
      }),
      active: () => ({
        style: {
          backgroundColor: "yellowgreen",
          color: "darkgreen",
        },
        content: <FontAwesomeIcon icon={faClipboard} />,
        onClick: undefined,
      }),
      loading: () => ({
        style: {
          opacity: 0.5,
        },
        content: <div className="lds-dual-ring"></div>,
        onClick: undefined,
      }),
    };

    const variant = map(context, {
      COPIED_TO_CLIPBOARD: variants.active,
      DIRTY: variants.loading,
      EDIT: variants.default,
      LOADED: variants.loading,
      SYNCING: variants.loading,
      SYNCING_DIRTY: variants.loading,
      FOCUSED: variants.loading,
      UNFOCUSED: variants.loading,
    });

    const readOnly = map(context, {
      FOCUSED: () => true,
      UNFOCUSED: () => true,
      LOADED: () => false,
      SYNCING: () => false,
      SYNCING_DIRTY: () => false,
      DIRTY: () => false,
      EDIT: () => false,
      COPIED_TO_CLIPBOARD: () => false,
    });

    return (
      <div>
        <ExcalidrawCanvas
          data={context.data}
          onChange={onChange}
          onInitialized={() => {
            excalidraw.dispatch({ type: "INITIALIZE_CANVAS_SUCCESS" });
          }}
          readOnly={readOnly}
        />
        <div className="edit" style={variant.style} onClick={variant.onClick}>
          {variant.content}
        </div>
      </div>
    );
  };

  return excalidraw.map({
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
    UPDATING: () => (
      <div className="center-wrapper">
        <div className="lds-dual-ring"></div>
      </div>
    ),
    LOADED: renderExcalidraw,
    FOCUSED: renderExcalidraw,
    EDIT: renderExcalidraw,
    COPIED_TO_CLIPBOARD: renderExcalidraw,
    SYNCING: renderExcalidraw,
    DIRTY: renderExcalidraw,
    SYNCING_DIRTY: renderExcalidraw,
    UNFOCUSED: renderExcalidraw,
  });
};
