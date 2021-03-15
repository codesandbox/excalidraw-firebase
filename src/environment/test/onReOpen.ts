import { OnReOpen } from "../interfaces";

export const createOnReOpen = (): OnReOpen & { trigger: () => void } => {
  let registeredCallback: (() => void) | undefined;
  const onReOpen = (cb: () => void) => {
    registeredCallback = cb;
    return () => {
      registeredCallback = undefined;
    };
  };

  onReOpen.trigger = () => {
    if (registeredCallback) {
      registeredCallback();
    }
  };

  return onReOpen;
};
