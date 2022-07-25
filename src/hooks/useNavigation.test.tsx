import * as React from "react";
import { act } from "@testing-library/react";

import { createStorage } from "../../environments/storage/test";
import { createAuthentication } from "../../environments/authentication/test";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import { renderReducer } from "react-states/test";
import { createTestEnvironment } from "../../environments/test";
import { NavigationState, useNavigation } from "./useNavigation";
import { EnvironmentProvider } from "../../environment-interface";
import { AuthenticatedAuthProvider } from "../useAuth";

describe("Dashboard", () => {
  test("Should go to EXCALIDRAW_CREATED when creating a new Excalidraw successfully", () => {
    const environment = createTestEnvironment();
    const history = createMemoryHistory();
    const navigate = jest.fn();
    const [state, dispatch] = renderReducer(
      () =>
        useNavigation({
          navigate,
        }),
      (UseNavigation) => (
        <EnvironmentProvider environment={environment}>
          <AuthenticatedAuthProvider
            auth={{
              loomApiKey: null,
              state: "AUTHENTICATED",
              user: {
                avatarUrl: null,
                name: "whatever",
                uid: "123",
              },
            }}
          >
            <Router history={history}>
              <UseNavigation />
            </Router>
          </AuthenticatedAuthProvider>
        </EnvironmentProvider>
      )
    );

    act(() => {
      dispatch({ type: "CREATE_EXCALIDRAW" });
    });

    expect(state).toEqual<NavigationState>({
      state: "CREATING_EXCALIDRAW",
    });

    expect(environment.storage.createExcalidraw).toBeCalled();

    act(() => {
      environment.storage.emit({
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
    const environment = createTestEnvironment();

    const navigate = jest.fn();
    const [state, dispatch] = renderReducer(
      () =>
        useNavigation({
          navigate: navigate,
        }),
      (UseNavigation) => (
        <EnvironmentProvider environment={environment}>
          <AuthenticatedAuthProvider
            auth={{
              state: "AUTHENTICATED",
              user: {
                avatarUrl: "",
                name: "Kate",
                uid: "123",
              },
              loomApiKey: "",
            }}
          >
            <UseNavigation />
          </AuthenticatedAuthProvider>
        </EnvironmentProvider>
      )
    );

    act(() => {
      dispatch({ type: "CREATE_EXCALIDRAW" });
    });

    expect(state).toEqual<NavigationState>({
      state: "CREATING_EXCALIDRAW",
    });

    expect(environment.storage.createExcalidraw).toBeCalled();

    act(() => {
      environment.storage.emit({
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
