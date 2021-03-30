import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import {
  ExcalidrawContext,
  ExcalidrawProvider,
  useExcalidraw,
} from "./Excalidraw";
import { EnvironmentProvider } from "../environment";
import { createOnVisibilityChange } from "../environment/onVisibilityChange/test";
import { createStorageMock } from "../environment/storage/test";
import { createExcalidrawImageMock } from "../environment/createExcalidrawImage/test";

describe("Excalidraw", () => {
  test("Should set UNFOCUSED state when moving away from tab in EDIT state", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();

    let excalidraw!: ReturnType<typeof useExcalidraw>;
    const ExcalidrawExposer = () => {
      excalidraw = useExcalidraw();

      return null;
    };

    render(
      <EnvironmentProvider
        environment={{
          onVisibilityChange,
        }}
      >
        <ExcalidrawProvider
          userId={userId}
          id={id}
          initialContext={{
            state: "EDIT",
            data: { appState: {}, elements: [], version: 0 },
            image: new Blob(),
            metadata: { id, author: userId, last_updated: new Date() },
          }}
        >
          <ExcalidrawExposer />
        </ExcalidrawProvider>
      </EnvironmentProvider>
    );

    act(() => {
      onVisibilityChange.trigger(false);
    });

    expect(excalidraw.context.state).toBe("UNFOCUSED");
  });

  test("Should set UNFOCUSED state when moving away from tab in SYNCING state", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorageMock();

    let excalidraw!: ReturnType<typeof useExcalidraw>;
    const ExcalidrawExposer = () => {
      excalidraw = useExcalidraw();

      return null;
    };

    render(
      <EnvironmentProvider
        environment={{
          storage,
          onVisibilityChange,
          createExcalidrawImage: createExcalidrawImageMock(),
        }}
      >
        <ExcalidrawProvider
          userId={userId}
          id={id}
          initialContext={{
            state: "SYNCING",
            data: { appState: {}, elements: [], version: 0 },
            metadata: { id, author: userId, last_updated: new Date() },
            image: new Blob(),
          }}
        >
          <ExcalidrawExposer />
        </ExcalidrawProvider>
      </EnvironmentProvider>
    );

    act(() => {
      onVisibilityChange.trigger(false);
    });

    await waitFor(() => expect(excalidraw.context.state).toBe("UNFOCUSED"));
  });

  test("Should set FOCUSED state when app becomes visible again, download update when Excalidraw has changed on server and go to EDIT", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorageMock();

    let excalidraw!: ReturnType<typeof useExcalidraw>;
    const ExcalidrawExposer = () => {
      excalidraw = useExcalidraw();

      return null;
    };

    render(
      <EnvironmentProvider
        environment={{
          onVisibilityChange,
          storage,
          createExcalidrawImage: createExcalidrawImageMock(),
        }}
      >
        <ExcalidrawProvider
          userId={userId}
          id={id}
          initialContext={{
            state: "UNFOCUSED",
            data: { appState: {}, elements: [], version: 0 },
            metadata: { id, author: userId, last_updated: new Date() },
            image: new Blob(),
          }}
        >
          <ExcalidrawExposer />
        </ExcalidrawProvider>
      </EnvironmentProvider>
    );

    act(() => {
      onVisibilityChange.trigger(true);
    });

    expect(excalidraw.context.state).toBe("FOCUSED");

    storage.hasExcalidrawUpdated.ok(true);

    await waitFor(() => expect(excalidraw.context.state).toBe("UPDATING"));

    storage.getExcalidraw.ok({
      data: {
        appState: {},
        elements: [],
        version: 0,
      },
      metadata: {
        author: "123",
        id: "1",
        last_updated: new Date(),
      },
    });

    await waitFor(() => expect(excalidraw.context.state).toBe("EDIT"));
  });

  test("Should set FOCUSED state when app becomes visible again and go to EDIT when there is no change on server", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorageMock();

    let excalidraw!: ReturnType<typeof useExcalidraw>;
    const ExcalidrawExposer = () => {
      excalidraw = useExcalidraw();

      return null;
    };

    render(
      <EnvironmentProvider
        environment={{
          onVisibilityChange,
          storage,
          createExcalidrawImage: createExcalidrawImageMock(),
        }}
      >
        <ExcalidrawProvider
          userId={userId}
          id={id}
          initialContext={{
            state: "UNFOCUSED",
            data: { appState: {}, elements: [], version: 0 },
            metadata: { id, author: userId, last_updated: new Date() },
            image: new Blob(),
          }}
        >
          <ExcalidrawExposer />
        </ExcalidrawProvider>
      </EnvironmentProvider>
    );

    act(() => {
      onVisibilityChange.trigger(true);
    });

    expect(excalidraw.context.state).toBe("FOCUSED");

    storage.hasExcalidrawUpdated.ok(false);

    await waitFor(() => expect(excalidraw.context.state).toBe("EDIT"));
  });
});
