import React from "react";
import { act, waitFor } from "@testing-library/react";
import { renderHook } from "react-states/test";
import { ExcalidrawFeature, useExcalidraw, ExcalidrawContext } from ".";
import { Environment } from "../../environment";
import { createStorage } from "../../environment/storage/test";
import { ExcalidrawData } from "./types";

describe("Excalidraw", () => {
  test("Should go to EDIT when loaded excalidraw and canvas is ready", () => {
    const userId = "123";
    const id = "456";
    const storage = createStorage();

    const [excalidraw, send] = renderHook(
      () => useExcalidraw(),
      (UseExcalidraw) => (
        <Environment
          environment={{
            storage,
          }}
        >
          <ExcalidrawFeature userId={userId} id={id}>
            <UseExcalidraw />
          </ExcalidrawFeature>
        </Environment>
      )
    );

    const data = {
      appState: { viewBackgroundColor: "#FFF" },
      elements: [],
      version: 0,
    };
    const image = {} as Blob;
    const metadata = {
      author: "123",
      id: "456",
      last_updated: new Date(),
    };

    act(() => {
      storage.events.emit({
        type: "STORAGE:FETCH_EXCALIDRAW_SUCCESS",
        data,
        image,
        metadata,
      });
    });

    expect(excalidraw).toEqual<ExcalidrawContext>({
      state: "LOADED",
      data,
      metadata,
      image,
      clipboard: {
        state: "NOT_COPIED",
      },
    });

    act(() => {
      send({
        type: "INITIALIZE_CANVAS_SUCCESS",
      });
    });

    expect(excalidraw).toEqual<ExcalidrawContext>({
      state: "EDIT",
      data,
      metadata,
      image,
      clipboard: {
        state: "NOT_COPIED",
      },
    });
  });
  test("Should go to SYNCING when excalidraw is changed", async () => {
    const userId = "123";
    const id = "456";
    const storage = createStorage();

    const image = {} as Blob;
    const metadata = {
      author: "123",
      id: "456",
      last_updated: new Date(),
    };
    const [excalidraw, send] = renderHook(
      () => useExcalidraw(),
      (UseExcalidraw) => (
        <Environment
          environment={{
            storage,
          }}
        >
          <ExcalidrawFeature
            userId={userId}
            id={id}
            initialContext={{
              state: "EDIT",
              data: {
                appState: { viewBackgroundColor: "#FFF" },
                elements: [],
                version: 0,
              },
              image,
              metadata,
              clipboard: {
                state: "NOT_COPIED",
              },
            }}
          >
            <UseExcalidraw />
          </ExcalidrawFeature>
        </Environment>
      )
    );

    const newData: ExcalidrawData = {
      appState: { viewBackgroundColor: "#FFF" },
      elements: [{ id: "4", version: 0 }],
      version: 1,
    };

    act(() => {
      send({ type: "EXCALIDRAW_CHANGE", data: newData });
    });

    expect(excalidraw).toEqual<ExcalidrawContext>({
      state: "DIRTY",
      data: newData,
      metadata,
      image,
      clipboard: {
        state: "NOT_COPIED",
      },
    });

    await waitFor(() =>
      expect(excalidraw).toEqual<ExcalidrawContext>({
        state: "SYNCING",
        data: newData,
        metadata,
        image,
        clipboard: {
          state: "NOT_COPIED",
        },
      })
    );
  });
  test("Should go to DIRTY when excalidraw is changed during SYNCING that is successful", async () => {
    const userId = "123";
    const id = "456";
    const storage = createStorage();

    const image = {} as Blob;
    const metadata = {
      author: "123",
      id: "456",
      last_updated: new Date(),
    };
    const [excalidraw, send] = renderHook(
      () => useExcalidraw(),
      (UseExcalidraw) => (
        <Environment
          environment={{
            storage,
          }}
        >
          <ExcalidrawFeature
            userId={userId}
            id={id}
            initialContext={{
              state: "SYNCING",
              data: {
                appState: { viewBackgroundColor: "#FFF" },
                elements: [],
                version: 0,
              },
              image,
              metadata,
              clipboard: {
                state: "NOT_COPIED",
              },
            }}
          >
            <UseExcalidraw />
          </ExcalidrawFeature>
        </Environment>
      )
    );

    const newData: ExcalidrawData = {
      appState: { viewBackgroundColor: "#FFF" },
      elements: [{ id: "4", version: 0 }],
      version: 1,
    };

    act(() => {
      send({ type: "EXCALIDRAW_CHANGE", data: newData });
    });

    expect(excalidraw).toEqual<ExcalidrawContext>({
      state: "SYNCING_DIRTY",
      data: newData,
      metadata,
      image,
      clipboard: {
        state: "NOT_COPIED",
      },
    });

    const newImage = {} as Blob;
    const newMetadata = {
      author: "123",
      id: "456",
      last_updated: new Date(),
    };

    act(() => {
      storage.events.emit({
        type: "STORAGE:SAVE_EXCALIDRAW_SUCCESS",
        image: newImage,
        metadata: newMetadata,
      });
    });

    expect(excalidraw).toEqual<ExcalidrawContext>({
      state: "DIRTY",
      data: newData,
      metadata: newMetadata,
      image: newImage,
      clipboard: {
        state: "NOT_COPIED",
      },
    });
  });
});
