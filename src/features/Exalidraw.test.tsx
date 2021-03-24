import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { Context, ExcalidrawProvider, useExcalidraw } from "./Excalidraw";
import { EnvironmentProvider } from "../environment";
import { createOnVisibilityChange } from "../environment/test/onVisibilityChange";
import { createStorageMock } from "../environment/test/storage";
import { createExcalidrawImage } from "../environment/test/createExcalidrawImage";

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

    expect(excalidraw.context.state).toBe<Context["state"]>("UNFOCUSED");
  });

  test("Should set UNFOCUSED state when moving away from tab in SYNCING state", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorageMock({});

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
          createExcalidrawImage,
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

    await waitFor(() =>
      expect(excalidraw.context.state).toBe<Context["state"]>("UNFOCUSED")
    );
  });

  test("Should set UNFOCUSED_DIRTY state when moving away from tab in DIRTY state", async () => {
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
            state: "DIRTY",
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

    expect(excalidraw.context.state).toBe<Context["state"]>("UNFOCUSED_DIRTY");
  });

  test("Should set UNFOCUSED_DIRTY state when moving away from tab in SYNCING_DIRTY state", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorageMock({
      async getExcalidraw() {
        return {
          data: { elements: [], appState: {}, version: 0 },
          metadata: {
            author: userId,
            id,
            last_updated: new Date(),
          },
        };
      },
    });

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
          createExcalidrawImage,
        }}
      >
        <ExcalidrawProvider
          userId={userId}
          id={id}
          initialContext={{
            state: "SYNCING_DIRTY",
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

    expect(excalidraw.context.state).toBe<Context["state"]>("UNFOCUSED_DIRTY");
  });

  test("Should set FOCUSED state when app becomes visible again, download update Excalidraw and go to EDIT", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorageMock({
      getExcalidraw: async () => ({
        data: { version: 1, elements: [], appState: {} },
        metadata: { last_updated: new Date(), id, author: userId },
      }),
    });

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
          createExcalidrawImage,
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

    expect(excalidraw.context.state).toBe<Context["state"]>("FOCUSED");

    await waitFor(() =>
      expect(excalidraw.context.state).toBe<Context["state"]>("EDIT")
    );
  });

  test("Should set FOCUSED_DIRTY state when app becomes visible again on UNFOCUSED_DIRTY", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorageMock({
      getExcalidraw: async () => ({
        data: { version: 1, elements: [], appState: {} },
        metadata: { last_updated: new Date(), id, author: userId },
      }),
    });

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
        }}
      >
        <ExcalidrawProvider
          userId={userId}
          id={id}
          initialContext={{
            state: "UNFOCUSED_DIRTY",
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

    expect(excalidraw.context.state).toBe<Context["state"]>("FOCUSED_DIRTY");
  });
  test("Should go to EDIT when continuing from FOCUSED_DIRTY", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorageMock({
      getExcalidraw: async () => ({
        data: { version: 1, elements: [], appState: {} },
        metadata: { last_updated: new Date(), id, author: userId },
      }),
    });

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
        }}
      >
        <ExcalidrawProvider
          userId={userId}
          id={id}
          initialContext={{
            state: "FOCUSED_DIRTY",
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
      excalidraw.dispatch({ type: "CONTINUE" });
    });

    expect(excalidraw.context.state).toBe<Context["state"]>("EDIT");
  });
  test("Should go to FOCUSED, fetching data and then EDIT when refreshing from FOCUSED_DIRTY", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorageMock({
      getExcalidraw: async () => ({
        data: { version: 1, elements: [], appState: {} },
        metadata: { last_updated: new Date(), id, author: userId },
      }),
    });

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
          createExcalidrawImage,
        }}
      >
        <ExcalidrawProvider
          userId={userId}
          id={id}
          initialContext={{
            state: "FOCUSED_DIRTY",
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
      excalidraw.dispatch({ type: "REFRESH" });
    });

    expect(excalidraw.context.state).toBe<Context["state"]>("FOCUSED");

    await waitFor(() =>
      expect(excalidraw.context.state).toBe<Context["state"]>("EDIT")
    );
  });
});
