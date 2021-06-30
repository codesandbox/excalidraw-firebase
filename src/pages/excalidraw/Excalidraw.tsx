import React, { useEffect, useMemo, useRef } from "react";
import debounce from "lodash.debounce";
import { getSceneVersion } from "@excalidraw/excalidraw";
import { PickContext, match } from "react-states";
import { ExcalidrawCanvas } from "./ExcalidrawCanvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { ExcalidrawContext, useExcalidraw } from "../../features/Excalidraw";
import { isSupported, setup } from "@loomhq/loom-sdk";
import { useAuth } from "../../features/Auth";

type RenderExcalidrawContext = PickContext<
  ExcalidrawContext,
  "LOADED" | "EDIT" | "SYNCING" | "DIRTY" | "SYNCING_DIRTY"
>;

export const Excalidraw = () => {
  const [auth] = useAuth("AUTHENTICATED");
  const [excalidraw, send] = useExcalidraw();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onChange = useMemo(
    () =>
      debounce((elements, appState) => {
        send({
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

  useEffect(() => {
    if (auth.loomApiKey) {
      let dispose = () => {};
      setup({
        apiKey: auth.loomApiKey,
      }).then(({ configureButton, teardown }) => {
        dispose = teardown;

        configureButton({
          element: buttonRef.current!,
          hooks: {
            onInsertClicked: (shareLink) => {
              console.log("clicked insert");
              console.log(shareLink);
            },
            onStart: () => console.log("start"),
            onCancel: () => console.log("cancelled"),
            onComplete: () => console.log("complete"),
          },
        });
      });

      return dispose;
    }
  }, []);

  const renderExcalidraw = (context: RenderExcalidrawContext) => {
    const copyToClipboard = () => {
      send({ type: "COPY_TO_CLIPBOARD" });
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
      EDIT: () =>
        match(context.clipboard, {
          COPIED: variants.active,
          NOT_COPIED: variants.default,
        }),
    });

    return (
      <div>
        <ExcalidrawCanvas
          data={context.data}
          onChange={onChange}
          onInitialized={() => {
            send({ type: "INITIALIZE_CANVAS_SUCCESS" });
          }}
        />
        <div className="edit" style={variant.style} onClick={variant.onClick}>
          {variant.content}
        </div>
        <button
          ref={buttonRef}
          style={{
            position: "absolute",
            zIndex: 9999999,
            right: "8rem",
            top: "1rem",
          }}
          onClick={() => {}}
        >
          Test Loom
        </button>
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
    LOADED: renderExcalidraw,
    EDIT: renderExcalidraw,
    SYNCING: renderExcalidraw,
    DIRTY: renderExcalidraw,
    SYNCING_DIRTY: renderExcalidraw,
  });
};
