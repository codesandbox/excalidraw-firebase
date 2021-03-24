import { OnVisibilityChange } from "../interfaces";

type MockedOnVisibilityChange = OnVisibilityChange & {
  trigger: (visible: boolean) => void;
};

export const createOnVisibilityChange = () => {
  let registeredCallback: ((visible: boolean) => void) | undefined;
  const onVisibilityChange: MockedOnVisibilityChange = (cb) => {
    registeredCallback = cb;
    return () => {
      registeredCallback = undefined;
    };
  };

  onVisibilityChange.trigger = (visible) => {
    if (registeredCallback) {
      registeredCallback(visible);
    }
  };

  return onVisibilityChange;
};
