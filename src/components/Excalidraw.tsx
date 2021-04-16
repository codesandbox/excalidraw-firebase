import React, { useMemo } from "react";
import debounce from "lodash.debounce";
import { getSceneVersion } from "@excalidraw/excalidraw";
import { PickState, match } from "react-states";
import { ExcalidrawCanvas } from "./ExcalidrawCanvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { ExcalidrawContext, useExcalidraw } from "../features/Excalidraw";

type RenderExcalidrawContext = PickState<
  ExcalidrawContext,
  | "LOADED"
  | "EDIT"
  | "SYNCING"
  | "DIRTY"
  | "SYNCING_DIRTY"
  | "UNFOCUSED"
  | "FOCUSED"
  | "UPDATING_FROM_PEER"
>;

export const Excalidraw = () => {
  const [excalidraw, dispatch] = useExcalidraw();

  const onChange = useMemo(
    () =>
      debounce((elements, appState) => {
        dispatch({
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
      dispatch({ type: "COPY_TO_CLIPBOARD" });
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

    const variant = match(context, {
      DIRTY: variants.loading,
      LOADED: variants.loading,
      SYNCING: variants.loading,
      SYNCING_DIRTY: variants.loading,
      FOCUSED: variants.loading,
      UNFOCUSED: variants.loading,
      UPDATING_FROM_PEER: variants.active,
      EDIT: () =>
        match(context.clipboard, {
          COPIED: variants.active,
          NOT_COPIED: variants.default,
        }),
    });

    const readOnly = match(context, {
      FOCUSED: () => true,
      UNFOCUSED: () => true,
      LOADED: () => false,
      SYNCING: () => false,
      SYNCING_DIRTY: () => false,
      DIRTY: () => false,
      EDIT: () => false,
      UPDATING_FROM_PEER: () => false,
    });

    return (
      <div>
        <ExcalidrawCanvas
          data={context.data}
          onChange={onChange}
          onInitialized={() => {
            dispatch({ type: "INITIALIZE_CANVAS_SUCCESS" });
          }}
          readOnly={readOnly}
          state={context.state}
        />
        <div className="edit" style={variant.style} onClick={variant.onClick}>
          {variant.content}
        </div>
      </div>
    );
  };

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
    UPDATING: () => (
      <div className="center-wrapper">
        <div className="lds-dual-ring"></div>
      </div>
    ),
    LOADED: renderExcalidraw,
    FOCUSED: renderExcalidraw,
    EDIT: renderExcalidraw,
    SYNCING: renderExcalidraw,
    DIRTY: renderExcalidraw,
    SYNCING_DIRTY: renderExcalidraw,
    UNFOCUSED: renderExcalidraw,
    UPDATING_FROM_PEER: renderExcalidraw,
  });
};
