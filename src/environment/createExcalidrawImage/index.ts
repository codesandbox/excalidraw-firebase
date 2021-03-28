import { Result } from "react-states";

export type CreateError = {
  type: "ERROR";
  data: Error;
};

export interface CreateExcalidrawImage {
  (elements: any[], appState: any): Result<Blob, CreateError>;
}
