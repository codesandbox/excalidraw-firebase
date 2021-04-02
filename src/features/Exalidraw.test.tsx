import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import {
  ExcalidrawFeature,
  ExcalidrawStates,
  useExcalidraw,
} from "./Excalidraw";
import { Environment } from "../environment";
import { createOnVisibilityChange } from "../environment/onVisibilityChange/test";
import { createStorage } from "../environment/storage/test";
import { createCreateExcalidrawImage } from "../environment/createExcalidrawImage/test";

describe("Excalidraw", () => {
  test("Should go to UNFOCUSED when moving away from tab in EDIT state", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();

    let excalidraw!: ExcalidrawStates;
    const ExcalidrawConsumer = () => {
      excalidraw = useExcalidraw();

      return null;
    };

    render(
      <Environment
        environment={{
          onVisibilityChange,
        }}
      >
        <ExcalidrawFeature
          userId={userId}
          id={id}
          initialContext={{
            state: "EDIT",
            data: { appState: {}, elements: [], version: 0 },
            image: new Blob(),
            metadata: { id, author: userId, last_updated: new Date() },
          }}
        >
          <ExcalidrawConsumer />
        </ExcalidrawFeature>
      </Environment>
    );

    act(() => {
      onVisibilityChange.trigger(false);
    });

    expect(excalidraw.context.state).toBe("UNFOCUSED");
  });

  test("Should go to UNFOCUSED when moving away from tab in SYNCING state", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorage();

    let excalidraw!: ExcalidrawStates;
    const ExcalidrawConsumer = () => {
      excalidraw = useExcalidraw();

      return null;
    };

    render(
      <Environment
        environment={{
          storage,
          onVisibilityChange,
          createExcalidrawImage: createCreateExcalidrawImage(),
        }}
      >
        <ExcalidrawFeature
          userId={userId}
          id={id}
          initialContext={{
            state: "SYNCING",
            data: { appState: {}, elements: [], version: 0 },
            metadata: { id, author: userId, last_updated: new Date() },
            image: new Blob(),
          }}
        >
          <ExcalidrawConsumer />
        </ExcalidrawFeature>
      </Environment>
    );

    act(() => {
      onVisibilityChange.trigger(false);
    });

    await waitFor(() => expect(excalidraw.context.state).toBe("UNFOCUSED"));
  });

  test("Should go to FOCUSED when app becomes visible again, download update when Excalidraw has changed on server and go to EDIT", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorage();

    let excalidraw!: ExcalidrawStates;
    const ExcalidrawConsumer = () => {
      excalidraw = useExcalidraw();

      return null;
    };

    render(
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
            data: { appState: {}, elements: [], version: 0 },
            metadata: { id, author: userId, last_updated: new Date() },
            image: new Blob(),
          }}
        >
          <ExcalidrawConsumer />
        </ExcalidrawFeature>
      </Environment>
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

  test("Should go to FOCUSED when app becomes visible again and go to EDIT when there is no change on server", async () => {
    const userId = "123";
    const id = "456";
    const onVisibilityChange = createOnVisibilityChange();
    const storage = createStorage();

    let excalidraw!: ExcalidrawStates;
    const ExcalidrawConsumer = () => {
      excalidraw = useExcalidraw();

      return null;
    };

    render(
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
            data: { appState: {}, elements: [], version: 0 },
            metadata: { id, author: userId, last_updated: new Date() },
            image: new Blob(),
          }}
        >
          <ExcalidrawConsumer />
        </ExcalidrawFeature>
      </Environment>
    );

    act(() => {
      onVisibilityChange.trigger(true);
    });

    expect(excalidraw.context.state).toBe("FOCUSED");

    storage.hasExcalidrawUpdated.ok(false);

    await waitFor(() => expect(excalidraw.context.state).toBe("EDIT"));
  });
});
