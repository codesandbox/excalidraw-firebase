import * as React from "react";
import { act } from "@testing-library/react";
import { EnvironmentProvider } from "../../environments";
import { createStorage } from "../../environments/storage/test";
import { createAuthentication } from "../../environments/authentication/test";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import { NavigationState, NavigationFeature, useNavigation } from ".";
import { renderHook } from "react-states/test";

describe("Dashboard", () => {
  test("Should go to EXCALIDRAW_CREATED when creating a new Excalidraw successfully", () => {
    const storage = createStorage();
    const history = createMemoryHistory();
    const navigate = jest.fn();
    const [state, dispatch] = renderHook(
      () => useNavigation(),
      (UseNavigation) => (
        <EnvironmentProvider
          environment={{
            authentication: createAuthentication(),
            storage,
          }}
        >
          <Router history={history}>
            <NavigationFeature
              auth={{
                state: "AUTHENTICATED",
                user: {
                  avatarUrl: "",
                  name: "Kate",
                  uid: "123",
                },
                loomApiKey: "",
              }}
              navigate={navigate}
            >
              <UseNavigation />
            </NavigationFeature>
          </Router>
        </EnvironmentProvider>
      )
    );

    act(() => {
      dispatch({ type: "CREATE_EXCALIDRAW" });
    });

    expect(state).toEqual<NavigationState>({
      state: "CREATING_EXCALIDRAW",
    });

    expect(storage.createExcalidraw).toBeCalled();

    act(() => {
      storage.subscription.emit({
        type: "STORAGE:CREATE_EXCALIDRAW_SUCCESS",
        id: "456",
      });
    });

    expect(state).toEqual<NavigationState>({
      state: "EXCALIDRAW_CREATED",
      id: "456",
    });
    expect(history.entries[1].pathname).toBe("/123/456");
  });
  test("Should go to CREATE_EXCALIDRAW_ERROR when creating a new Excalidraw unsuccessfully", () => {
    const storage = createStorage();
    const navigate = jest.fn();
    const [state, dispatch] = renderHook(
      () => useNavigation(),
      (UseNavigation) => (
        <EnvironmentProvider
          environment={{
            authentication: createAuthentication(),
            storage,
          }}
        >
          <NavigationFeature
            auth={{
              state: "AUTHENTICATED",
              user: {
                avatarUrl: "",
                name: "Kate",
                uid: "123",
              },
              loomApiKey: "",
            }}
            navigate={navigate}
          >
            <UseNavigation />
          </NavigationFeature>
        </EnvironmentProvider>
      )
    );

    act(() => {
      dispatch({ type: "CREATE_EXCALIDRAW" });
    });

    expect(state).toEqual<NavigationState>({
      state: "CREATING_EXCALIDRAW",
    });

    expect(storage.createExcalidraw).toBeCalled();

    act(() => {
      storage.subscription.emit({
        type: "STORAGE:CREATE_EXCALIDRAW_ERROR",
        error: "Could not create Excalidraw",
      });
    });

    expect(state).toEqual<NavigationState>({
      state: "CREATE_EXCALIDRAW_ERROR",
      error: "Could not create Excalidraw",
    });
  });
});
