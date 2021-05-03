import { Events } from "react-states";

export type VisibilityEvent =
  | {
      type: "VISIBILITY:VISIBLE";
    }
  | {
      type: "VISIBILITY:HIDDEN";
    };

export interface Visibility {
  events: Events<VisibilityEvent>;
}
