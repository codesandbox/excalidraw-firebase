import { OnReOpen } from "../interfaces";

const subscriptions: Array<() => void> = [];

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    subscriptions.forEach((cb) => cb());
  }
});

export const onReOpen: OnReOpen = (cb) => {
  subscriptions.push(cb);
  return () => {
    subscriptions.splice(subscriptions.indexOf(cb), 1);
  };
};
