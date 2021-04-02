import { OnVisibilityChange } from ".";

export const createOnVisibilityChange = (): OnVisibilityChange => {
  const subscriptions: Array<(visibility: boolean) => void> = [];

  document.addEventListener("visibilitychange", () => {
    subscriptions.forEach((cb) => cb(document.visibilityState === "visible"));
  });

  return (cb) => {
    subscriptions.push(cb);
    return () => {
      subscriptions.splice(subscriptions.indexOf(cb), 1);
    };
  };
};
