import React from "react";
import { act, waitFor } from "@testing-library/react";
import { renderHook } from "react-states/test";
import {
  ExcalidrawFeature,
  useExcalidraw,
  ExcalidrawContext,
  ExcalidrawElement,
} from ".";
import { Environment } from "../../environment";
import { createVisibility } from "../../environment/visibility/test";
import { createStorage } from "../../environment/storage/test";

describe("Excalidraw", () => {
  test.only("Should go to UNFOCUSED when moving away from tab in EDIT state", async () => {
    const userId = "123";
    const id = "456";
    const visibility = createVisibility();
    const storage = createStorage();
    const [excalidraw] = renderHook(
      () => useExcalidraw(),
      (UseExcalidraw) => (
        <Environment
          environment={{
            visibility,
            storage,
          }}
        >
          <ExcalidrawFeature
            userId={userId}
            id={id}
            initialContext={{
              state: "EDIT",
              data: {
                appState: {
                  viewBackgroundColor: "#FFF",
                },
                elements: [],
                version: 0,
              },
              image: new Blob(),
              metadata: { id, author: userId, last_updated: new Date() },
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

    act(() => {
      visibility.events.emit({
        type: "VISIBILITY:HIDDEN",
      });
    });

    expect(excalidraw.state).toBe("UNFOCUSED");
  });

  test("Should go to UNFOCUSED when moving away from tab in SYNCING state", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorage();
    const [excalidraw] = renderHook(
      () => useExcalidraw(),
      (UseExcalidraw) => (
        <Environment
          environment={{
            storage,
            onVisibilityChange,
          }}
        >
          <ExcalidrawFeature
            userId={userId}
            id={id}
            initialContext={{
              state: "SYNCING",
              data: {
                appState: {
                  viewBackgroundColor: "#FFF",
                },
                elements: [],
                version: 0,
              },
              metadata: { id, author: userId, last_updated: new Date() },
              image: new Blob(),
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

    act(() => {
      onVisibilityChange.trigger(false);
    });

    await waitFor(() => expect(excalidraw.state).toBe("UNFOCUSED"));
  });

  test("Should go to FOCUSED when app becomes visible again, download update when Excalidraw has changed on server and go to EDIT", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorage();
    const [excalidraw] = renderHook(
      () => useExcalidraw(),
      (UseExcalidraw) => (
        <Environment
          environment={{
            onVisibilityChange,
            storage,
          }}
        >
          <ExcalidrawFeature
            userId={userId}
            id={id}
            initialContext={{
              state: "UNFOCUSED",
              data: {
                appState: {
                  viewBackgroundColor: "#FFF",
                },
                elements: [],
                version: 0,
              },
              metadata: { id, author: userId, last_updated: new Date() },
              image: new Blob(),
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

    act(() => {
      onVisibilityChange.trigger(true);
    });

    expect(excalidraw.state).toBe("FOCUSED");

    storage.hasExcalidrawUpdated.ok(true);

    await waitFor(() => expect(excalidraw.state).toBe("UPDATING"));

    storage.getExcalidraw.ok({
      data: {
        appState: {
          viewBackgroundColor: "#FFF",
        },
        elements: [],
        version: 0,
      },
      metadata: {
        author: "123",
        id: "1",
        last_updated: new Date(),
      },
    });

    await waitFor(() => expect(excalidraw.state).toBe("EDIT"));
  });

  test("Should go to FOCUSED when app becomes visible again and go to EDIT when there is no change on server", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorage();
    const [excalidraw] = renderHook(
      () => useExcalidraw(),
      (UseExcalidraw) => (
        <Environment
          environment={{
            onVisibilityChange,
            storage,
            createExcalidrawImage: createCreateExcalidrawImage(),
          }}
        >
          <ExcalidrawFeature
            userId={userId}
            id={id}
            initialContext={{
              state: "UNFOCUSED",
              data: {
                appState: {
                  viewBackgroundColor: "#FFF",
                },
                elements: [],
                version: 0,
              },
              metadata: { id, author: userId, last_updated: new Date() },
              image: new Blob(),
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

    act(() => {
      onVisibilityChange.trigger(true);
    });

    expect(excalidraw.state).toBe("FOCUSED");

    storage.hasExcalidrawUpdated.ok(false);

    await waitFor(() => expect(excalidraw.state).toBe("EDIT"));
  });
  test("Should go to UPDATE_FROM_PEER when receiving subscription update in all active subscription states", async () => {
    const userId = "123";
    const id = "456";
    const subscriptionStates = [
      "DIRTY",
      "EDIT",
      "UPDATING_FROM_PEER",
      "SYNCING",
      "SYNCING_DIRTY",
      "UPDATING",
    ] as const;

    subscriptionStates.forEach((state) => {
      const storage = createStorage();
      const onVisibilityChange = createOnVisibilityChange();
      const createExcalidrawImage = createCreateExcalidrawImage();
      const [excalidraw] = renderHook(
        () => useExcalidraw(),
        (UseExcalidraw) => (
          <Environment
            environment={{
              storage,
              createExcalidrawImage,
              onVisibilityChange,
            }}
          >
            <ExcalidrawFeature
              userId={userId}
              id={id}
              initialContext={{
                state,
                data: {
                  appState: { viewBackgroundColor: "#FFF" },
                  elements: [],
                  version: 0,
                },
                metadata: { id, author: userId, last_updated: new Date() },
                image: new Blob(),
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

      act(() => {
        storage.subscribeToChanges.trigger({
          appState: { viewBackgroundColor: "#FFF" },
          elements: [],
          version: 1,
        });
      });

      expect(excalidraw.state).toBe("UPDATING_FROM_PEER");
    });
  });
  test("Should go to UPDATE_FROM_PEER with merged elements when recieving subscription update", async () => {
    const userId = "123";
    const id = "456";
    const storage = createStorage();
    const onVisibilityChange = createOnVisibilityChange();
    const createExcalidrawImage = createCreateExcalidrawImage();
    // We test elements out of order, where existing has
    // an update and new elements has an udpate
    const existingElements: ExcalidrawElement[] = [
      {
        id: "1",
        version: 1,
      },
      {
        id: "0",
        version: 0,
      },
    ];
    const newElements: ExcalidrawElement[] = [
      {
        id: "0",
        version: 1,
      },
      {
        id: "1",
        version: 0,
      },
    ];
    const finalElements: ExcalidrawElement[] = [
      {
        id: "0",
        version: 1,
      },
      {
        id: "1",
        version: 1,
      },
    ];
    // Jest does not support "toEqual" Blob
    const fakeBlob = null as any;
    const initialContext: ExcalidrawContext = {
      state: "EDIT",
      data: {
        appState: { viewBackgroundColor: "#FFF" },
        elements: existingElements,
        version: 0,
      },
      metadata: { id, author: userId, last_updated: new Date() },
      image: fakeBlob,
      clipboard: {
        state: "NOT_COPIED",
      },
    } as const;
    const [excalidraw] = renderHook(
      () => useExcalidraw(),
      (UseExcalidraw) => (
        <Environment
          environment={{
            storage,
            createExcalidrawImage,
            onVisibilityChange,
          }}
        >
          <ExcalidrawFeature
            userId={userId}
            id={id}
            initialContext={initialContext}
          >
            <UseExcalidraw />
          </ExcalidrawFeature>
        </Environment>
      )
    );

    act(() => {
      storage.subscribeToChanges.trigger({
        appState: { viewBackgroundColor: "#FFF" },
        elements: newElements,
        version: 1,
      });
    });

    expect(excalidraw).toEqual<ExcalidrawContext>({
      ...initialContext,
      state: "UPDATING_FROM_PEER",
      data: {
        ...initialContext.data,
        elements: finalElements,
        version: 1,
      },
    });
  });
});
