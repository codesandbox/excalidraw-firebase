import { err, ok, result } from "react-states";
import { CreateError, CreateExcalidrawImage } from ".";

export const createExcalidrawImageMock = (
  error?: CreateError
): CreateExcalidrawImage => () => {
  const promise = Promise.resolve(
    error ? err(error.type, error.data) : ok(new Blob())
  );

  return result(promise);
};
