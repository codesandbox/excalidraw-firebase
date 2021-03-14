import React, { useMemo } from "react";
import debounce from "lodash.debounce";
import { getSceneVersion } from "@excalidraw/excalidraw";
import { PickState } from "react-states";
import { ExcalidrawCanvas } from "./ExcalidrawCanvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { Context, useExcalidraw } from "../features/Excalidraw";
import { PopoverMenu } from "./PopoverMenu";
import { useExternals } from "../externals";

export const Excalidraw = () => {
  const { createExcalidrawImage } = useExternals();
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

  const renderExcalidraw = (
    context: PickState<
      Context,
      | "LOADED"
      | "EDIT"
      | "EDIT_CLIPBOARD"
      | "SYNCING"
      | "DIRTY"
      | "SYNCING_DIRTY"
    >
  ) => (
    <div>
      <ExcalidrawCanvas
        data={context.data}
        onChange={onChange}
        onInitialized={() => {
          createExcalidrawImage(
            context.data.elements,
            context.data.appState
          ).then((image) => {
            excalidraw.dispatch({ type: "INITIALIZE_CANVAS_SUCCESS", image });
          });
        }}
      />
      <PopoverMenu onDelete={() => {}} />
      <div
        className="edit"
        style={excalidraw.map({
          EDIT_CLIPBOARD: () => ({
            backgroundColor: "yellowgreen",
            color: "darkgreen",
          }),
          DIRTY: () => ({
            opacity: 0.5,
          }),
          SYNCING: () => ({
            opacity: 0.5,
          }),
          SYNCING_DIRTY: () => ({
            opacity: 0.5,
          }),
          EDIT: () => undefined,
          ERROR: () => undefined,
          LOADED: () => undefined,
          LOADING: () => undefined,
        })}
        onClick={() => {
          excalidraw.dispatch({ type: "COPY_TO_CLIPBOARD" });
        }}
      >
        {excalidraw.map({
          SYNCING: () => <div className="lds-dual-ring"></div>,
          SYNCING_DIRTY: () => <div className="lds-dual-ring"></div>,
          DIRTY: () => <div className="lds-dual-ring"></div>,
          EDIT: () => <FontAwesomeIcon icon={faClipboard} />,
          EDIT_CLIPBOARD: () => <FontAwesomeIcon icon={faClipboard} />,
          ERROR: () => null,
          LOADED: () => null,
          LOADING: () => null,
        })}
      </div>
    </div>
  );

  return excalidraw.map({
    LOADING: () => (
      <div className="center-wrapper">
        <h1>Loading...</h1>
      </div>
    ),
    ERROR: ({ error }) => (
      <div className="center-wrapper">
        <h1>OMG, error, {error}</h1>
      </div>
    ),
    LOADED: renderExcalidraw,
    EDIT: renderExcalidraw,
    EDIT_CLIPBOARD: renderExcalidraw,
    SYNCING: renderExcalidraw,
    DIRTY: renderExcalidraw,
    SYNCING_DIRTY: renderExcalidraw,
  });
};
