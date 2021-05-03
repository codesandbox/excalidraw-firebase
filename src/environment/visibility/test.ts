import { events } from "react-states";
import { Visibility } from ".";

export const createVisibility = (): Visibility => ({
  events: events(),
});
