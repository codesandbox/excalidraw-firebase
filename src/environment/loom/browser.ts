import { isSupported, setup } from "@loomhq/loom-sdk";
import { events } from "react-states";
import { Loom, LoomEvent } from ".";

type ButtonFn = ReturnType<typeof setup> extends Promise<infer R>
  ? R extends { configureButton: any }
    ? R["configureButton"]
    : never
  : never;

export const createLoom = (): Loom => {
  const loomEvents = events<LoomEvent>();

  let configureButton: ButtonFn | undefined;

  function initialize(configure: ButtonFn, buttonId: string) {
    const element = document.querySelector(`#${buttonId}`);

    if (!element) {
      loomEvents.emit({
        type: "LOOM:ERROR",
        error: "No button",
      });
      return;
    }

    configure({
      element: element as HTMLElement,
      hooks: {
        onInsertClicked: (video) => {
          if (video) {
            loomEvents.emit({
              type: "LOOM:INSERT",
              video,
            });
          } else {
            loomEvents.emit({
              type: "LOOM:CANCEL",
            });
          }
        },
        onStart: () => {
          loomEvents.emit({
            type: "LOOM:START",
          });
        },
        onCancel: () => {
          loomEvents.emit({
            type: "LOOM:CANCEL",
          });
        },
        onComplete: () => {
          loomEvents.emit({
            type: "LOOM:COMPLETE",
          });
        },
      },
    });
  }

  return {
    events: loomEvents,
    configure(apiKey, buttonId) {
      if (configureButton) {
        initialize(configureButton, buttonId);
      } else {
        setup({
          apiKey,
        }).then((result) => {
          loomEvents.emit({
            type: "LOOM:CONFIGURED",
          });
          configureButton = result.configureButton;
          initialize(configureButton, buttonId);
        });
      }
    },
    openVideo(video) {
      window.open(video.sharedUrl);
    },
  };
};
