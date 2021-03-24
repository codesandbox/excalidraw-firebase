import React, { useMemo } from "react";
import debounce from "lodash.debounce";
import { getSceneVersion } from "@excalidraw/excalidraw";
import { PickState, TMap, map } from "react-states";
import { ExcalidrawCanvas } from "./ExcalidrawCanvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { Context, useExcalidraw } from "../features/Excalidraw";
import { PopoverMenu } from "./PopoverMenu";
import { styled } from "../stitches.config";
// import * as Dialog from "@radix-ui/react-dialog";

const WarningOverlay = styled("div", {
  width: "100vw",
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const WarningText = styled("div", {
  padding: "1rem",
  fontSize: "20px",
  fontWeight: "bold",
});

const WarningButton = styled("button", {
  borderRadius: "3px",
  padding: "0.5rem 1rem",
  margin: "1rem",
  fontSize: "18px",
});

const WarningMessageContainer = styled("div", {
  zIndex: 1,
});

type RenderExcalidrawContext = PickState<
  Context,
  | "LOADED"
  | "EDIT"
  | "EDIT_CLIPBOARD"
  | "SYNCING"
  | "DIRTY"
  | "SYNCING_DIRTY"
  | "UNFOCUSED"
  | "UNFOCUSED_DIRTY"
>;

export const Excalidraw = () => {
  const excalidraw = useExcalidraw();

  const onChange = useMemo(
    () =>
      debounce((elements, appState) => {
        excalidraw.dispatch({
          type: "CHANGE_DETECTED",
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
      EDIT_CLIPBOARD: variants.active,
      DIRTY: variants.loading,
      EDIT: variants.default,
      LOADED: variants.loading,
      SYNCING: variants.loading,
      SYNCING_DIRTY: variants.loading,
      FOCUSED: variants.loading,
      FOCUSED_DIRTY: variants.loading,
      UNFOCUSED: variants.loading,
      UNFOCUSED_DIRTY: variants.loading,
    });

    const readOnly = map(context, {
      FOCUSED: () => true,
      FOCUSED_DIRTY: () => true,
      UNFOCUSED: () => true,
      UNFOCUSED_DIRTY: () => true,
      LOADED: () => false,
      SYNCING: () => false,
      SYNCING_DIRTY: () => false,
      DIRTY: () => false,
      EDIT: () => false,
      EDIT_CLIPBOARD: () => false,
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
        <PopoverMenu onDelete={() => {}} />
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
    FOCUSED: () => (
      <div className="center-wrapper">
        <div className="lds-dual-ring"></div>
      </div>
    ),
    FOCUSED_DIRTY: () => (
      <WarningOverlay>
        <WarningMessageContainer>
          <WarningText>
            You left the window in a DIRTY state, not sure what you want to do?
          </WarningText>
          <div>
            <WarningButton
              onClick={() => excalidraw.dispatch({ type: "CONTINUE" })}
            >
              Keep my local version
            </WarningButton>
            <WarningButton
              onClick={() => excalidraw.dispatch({ type: "REFRESH" })}
            >
              Update from server
            </WarningButton>
          </div>
        </WarningMessageContainer>
      </WarningOverlay>
    ),
    LOADED: renderExcalidraw,
    EDIT: renderExcalidraw,
    EDIT_CLIPBOARD: renderExcalidraw,
    SYNCING: renderExcalidraw,
    DIRTY: renderExcalidraw,
    SYNCING_DIRTY: renderExcalidraw,
    UNFOCUSED: renderExcalidraw,
    UNFOCUSED_DIRTY: renderExcalidraw,
  });
};
