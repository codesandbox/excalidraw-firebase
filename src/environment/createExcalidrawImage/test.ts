import { result } from "react-states";
import { CreateError, CreateExcalidrawImage } from ".";

export const createCreateExcalidrawImage = (
  error?: CreateError
): CreateExcalidrawImage => () =>
  result((ok, err) =>
    Promise.resolve(error ? err(error.type, error.data) : ok(new Blob()))
  );
