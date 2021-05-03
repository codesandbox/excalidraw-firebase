import * as React from "react";
import { act, waitFor } from "@testing-library/react";
import { Environment } from "../../environment";
import { createStorage } from "../../environment/storage/test";
import { createAuthentication } from "../../environment/authentication/test";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import { DashboardContext, DashboardFeature, useDashboard } from ".";
import { AuthFeature } from "../Auth";
import { renderHook } from "react-states/test";

describe("Dashboard", () => {
  test("Should go to PREVIEWS_LOADED when mounting and successfully downloading previews", () => {
    const storage = createStorage();

    const [context] = renderHook(
      () => useDashboard(),
      (UseDashboard) => (
        <Environment
          environment={{
            authentication: createAuthentication(),
            storage,
          }}
        >
          <AuthFeature
            initialContext={{
              state: "AUTHENTICATED",
              user: {
                avatarUrl: "",
                name: "Kate",
                uid: "123",
              },
            }}
          >
            <DashboardFeature>
              <UseDashboard />
            </DashboardFeature>
          </AuthFeature>
        </Environment>
      )
    );

    const mockedPreviews = {
      avatarUrl: "",
      name: "Kate",
      excalidraws: [
        {
          author: "Kate",
          id: "456",
          last_updated: new Date(),
        },
      ],
    };

    expect(storage.fetchPreviews).toBeCalled();

    act(() => {
      storage.events.emit({
        type: "STORAGE:FETCH_PREVIEWS_SUCCESS",
        excalidrawsByUser: {
          "123": mockedPreviews,
        },
      });
    });

    expect(context).toEqual<DashboardContext>({
      state: "PREVIEWS_LOADED",
      showCount: 10,
      excalidraws: {
        "123": mockedPreviews,
      },
    });
  });
  test("Should go to PREVIEWS_ERROR when mounting and unsuccessfully downloading previews", () => {
    const storage = createStorage();
    const [context] = renderHook(
      () => useDashboard(),
      (UseDashboard) => (
        <Environment
          environment={{
            authentication: createAuthentication(),
            storage,
          }}
        >
          <AuthFeature
            initialContext={{
              state: "AUTHENTICATED",
              user: {
                avatarUrl: "",
                name: "Kate",
                uid: "123",
              },
            }}
          >
            <DashboardFeature>
              <UseDashboard />
            </DashboardFeature>
          </AuthFeature>
        </Environment>
      )
    );

    expect(storage.fetchPreviews).toBeCalled();

    act(() => {
      storage.events.emit({
        type: "STORAGE:FETCH_PREVIEWS_ERROR",
        error: "Unable to download",
      });
    });

    expect(context).toEqual<DashboardContext>({
      state: "PREVIEWS_ERROR",
      error: "Unable to download",
    });
  });
  test("Should go to EXCALIDRAW_CREATED when creating a new Excalidraw successfully", () => {
    const storage = createStorage();
    const history = createMemoryHistory();
    const [context, dispatch] = renderHook(
      () => useDashboard(),
      (UseDashboard) => (
        <Environment
          environment={{
            authentication: createAuthentication(),
            storage,
          }}
        >
          <Router history={history}>
            <AuthFeature
              initialContext={{
                state: "AUTHENTICATED",
                user: {
                  avatarUrl: "",
                  name: "Kate",
                  uid: "123",
                },
              }}
            >
              <DashboardFeature
                initialContext={{
                  state: "PREVIEWS_LOADED",
                  excalidraws: {},
                  showCount: 10,
                }}
              >
                <UseDashboard />
              </DashboardFeature>
            </AuthFeature>
          </Router>
        </Environment>
      )
    );

    act(() => {
      dispatch({ type: "CREATE_EXCALIDRAW" });
    });

    expect(context).toEqual<DashboardContext>({
      state: "CREATING_EXCALIDRAW",
      excalidraws: {},
      showCount: 10,
    });

    expect(storage.createExcalidraw).toBeCalled();

    act(() => {
      storage.events.emit({
        type: "STORAGE:CREATE_EXCALIDRAW_SUCCESS",
        id: "456",
      });
    });

    expect(context).toEqual<DashboardContext>({
      state: "EXCALIDRAW_CREATED",
      id: "456",
    });
    expect(history.entries[1].pathname).toBe("/123/456");
  });
  test("Should go to CREATE_EXCALIDRAW_ERROR when creating a new Excalidraw unsuccessfully", () => {
    const storage = createStorage();

    const [context, dispatch] = renderHook(
      () => useDashboard(),
      (UseDashboard) => (
        <Environment
          environment={{
            authentication: createAuthentication(),
            storage,
          }}
        >
          <AuthFeature
            initialContext={{
              state: "AUTHENTICATED",
              user: {
                avatarUrl: "",
                name: "Kate",
                uid: "123",
              },
            }}
          >
            <DashboardFeature
              initialContext={{
                state: "PREVIEWS_LOADED",
                excalidraws: {},
                showCount: 10,
              }}
            >
              <UseDashboard />
            </DashboardFeature>
          </AuthFeature>
        </Environment>
      )
    );

    act(() => {
      dispatch({ type: "CREATE_EXCALIDRAW" });
    });

    expect(context).toEqual<DashboardContext>({
      state: "CREATING_EXCALIDRAW",
      excalidraws: {},
      showCount: 10,
    });

    expect(storage.createExcalidraw).toBeCalled();

    act(() => {
      storage.events.emit({
        type: "STORAGE:CREATE_EXCALIDRAW_ERROR",
        error: "Could not create Excalidraw",
      });
    });

    expect(context).toEqual<DashboardContext>({
      state: "CREATE_EXCALIDRAW_ERROR",
      error: "Could not create Excalidraw",
      excalidraws: {},
      showCount: 10,
    });
  });
});
