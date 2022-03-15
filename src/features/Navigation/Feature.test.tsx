import * as React from "react";
import { act } from "@testing-library/react";
import { EnvironmentProvider } from "../../environment";
import { createStorage } from "../../environment/storage/test";
import { createAuthentication } from "../../environment/authentication/test";
import { NavigationState, NavigationFeature, useNavigation } from ".";
import { renderHook } from "react-states/test";

describe("Dashboard", () => {
  test("Should go to EXCALIDRAW_CREATED when creating a new Excalidraw successfully", async () => {
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
        type: "STORAGE:CREATE_EXCALIDRAW_SUCCESS",
        id: "456",
      });
    });

    expect(state).toEqual<NavigationState>({
      state: "EXCALIDRAW_CREATED",
      id: "456",
    })

    expect(navigate).toBeCalledWith("/123/456");
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
