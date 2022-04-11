import { isSupported, setup } from "@loomhq/loom-sdk";
import { createSubscription, Emit } from "react-states";
import { Loom, LoomEvent } from "../../environment-interface/loom";

type ButtonFn = ReturnType<typeof setup> extends Promise<infer R>
  ? R extends { configureButton: any }
    ? R["configureButton"]
    : never
  : never;

export const createLoom = (emit: Emit<LoomEvent>): Loom => {
  let configureButton: ButtonFn | undefined;

  function initialize(configure: ButtonFn, buttonId: string) {
    const element = document.querySelector(`#${buttonId}`);

    if (!element) {
      emit({
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
            emit({
              type: "LOOM:INSERT",
              video,
            });
          } else {
            emit({
              type: "LOOM:CANCEL",
            });
          }
        },
        onStart: () => {
          emit({
            type: "LOOM:START",
          });
        },
        onCancel: () => {
          emit({
            type: "LOOM:CANCEL",
          });
        },
        onComplete: () => {
          emit({
            type: "LOOM:COMPLETE",
          });
        },
      },
    });
  }

  return {
    configure(apiKey, buttonId) {
      if (configureButton) {
        initialize(configureButton, buttonId);
      } else {
        setup({
          apiKey,
        }).then((result) => {
          emit({
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
