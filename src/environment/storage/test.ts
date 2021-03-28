import { Err, ok, Ok, Result, result } from "react-states";
import { Storage } from ".";

export const createStorageMock = <
  V extends {
    [T in keyof Storage]?: () => ReturnType<Storage[T]> extends Result<
      infer K,
      infer E
    >
      ? Ok<K> | Err<E>
      : never;
  }
>({
  createExcalidraw = () => ok("123"),
  getExcalidraw = () =>
    ok({
      data: {
        elements: [],
        appState: { viewBackgroundColor: "#333" },
        version: 0,
      },
      metadata: {
        id: "456",
        author: "123",
        last_updated: new Date(),
      },
    }),
  getPreviews = () => ok({}),
  saveExcalidraw = () => ok(undefined),
  saveImage = () => ok(undefined),
  getImageSrc = () => ok("123"),
}: V): Storage => ({
  createExcalidraw: () => result(Promise.resolve(createExcalidraw())),
  getExcalidraw: () => result(Promise.resolve(getExcalidraw())),
  getPreviews: () => result(Promise.resolve(getPreviews())),
  saveExcalidraw: () => result(Promise.resolve(saveExcalidraw())),
  saveImage: () => result(Promise.resolve(saveImage())),
  getImageSrc: () => result(Promise.resolve(getImageSrc())),
});
