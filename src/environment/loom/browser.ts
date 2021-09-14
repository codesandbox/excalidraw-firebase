import { isSupported, setup } from "@loomhq/loom-sdk";
import { createSubscription } from "react-states";
import { Loom, LoomAction } from ".";

type ButtonFn = ReturnType<typeof setup> extends Promise<infer R>
  ? R extends { configureButton: any }
    ? R["configureButton"]
    : never
  : never;

export const createLoom = (): Loom => {
  const subscription = createSubscription<LoomAction>();

  let configureButton: ButtonFn | undefined;

  function initialize(configure: ButtonFn, buttonId: string) {
    const element = document.querySelector(`#${buttonId}`);

    if (!element) {
      subscription.emit({
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
            subscription.emit({
              type: "LOOM:INSERT",
              video,
            });
          } else {
            subscription.emit({
              type: "LOOM:CANCEL",
            });
          }
        },
        onStart: () => {
          subscription.emit({
            type: "LOOM:START",
          });
        },
        onCancel: () => {
          subscription.emit({
            type: "LOOM:CANCEL",
          });
        },
        onComplete: () => {
          subscription.emit({
            type: "LOOM:COMPLETE",
          });
        },
      },
    });
  }

  return {
    subscription,
    configure(apiKey, buttonId) {
      if (configureButton) {
        initialize(configureButton, buttonId);
      } else {
        setup({
          apiKey,
        }).then((result) => {
          subscription.emit({
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
