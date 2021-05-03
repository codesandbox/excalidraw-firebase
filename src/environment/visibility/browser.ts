import { events } from "react-states";
import { Visibility, VisibilityEvent } from ".";

export const createVisibility = (): Visibility => {
  const visibilityEvents = events<VisibilityEvent>();

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      visibilityEvents.emit({
        type: "VISIBILITY:VISIBLE",
      });
    } else {
      visibilityEvents.emit({
        type: "VISIBILITY:HIDDEN",
      });
    }
  });

  return {
    events: visibilityEvents,
  };
};
