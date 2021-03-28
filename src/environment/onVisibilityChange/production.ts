import { OnVisibilityChange } from "./";

const subscriptions: Array<(visibility: boolean) => void> = [];

document.addEventListener("visibilitychange", () => {
  subscriptions.forEach((cb) => cb(document.visibilityState === "visible"));
});

export const onVisibilityChange: OnVisibilityChange = (cb) => {
  subscriptions.push(cb);
  return () => {
    subscriptions.splice(subscriptions.indexOf(cb), 1);
  };
};
