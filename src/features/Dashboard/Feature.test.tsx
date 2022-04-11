import * as React from "react";
import { act } from "@testing-library/react";
import { EnvironmentProvider } from "../../environments";
import { createStorage } from "../../environments/storage/test";
import { createAuthentication } from "../../environments/authentication/test";
import { DashboardState, DashboardFeature, useDashboard } from ".";
import { renderHook } from "react-states/test";

describe("Dashboard", () => {
  test("Should go to PREVIEWS_LOADED when mounting and successfully downloading previews", () => {
    const storage = createStorage();

    const [state] = renderHook(
      () => useDashboard(),
      (UseDashboard) => (
        <EnvironmentProvider
          environment={{
            authentication: createAuthentication(),
            storage,
          }}
        >
          <DashboardFeature>
            <UseDashboard />
          </DashboardFeature>
        </EnvironmentProvider>
      )
    );

    const mockedPreviews = [
      {
        user: {
          avatarUrl: "",
          name: "Kate",
          uid: "123",
        },
        metadata: {
          author: "Kate",
          id: "456",
          title: "Test",
          last_updated: new Date(),
        },
      },
    ];

    expect(storage.fetchPreviews).toBeCalled();

    act(() => {
      storage.subscription.emit({
        type: "STORAGE:FETCH_PREVIEWS_SUCCESS",
        excalidraws: mockedPreviews,
      });
    });

    expect(state).toEqual<DashboardState>({
      state: "PREVIEWS_LOADED",
      excalidraws: mockedPreviews,
    });
  });
  test("Should go to PREVIEWS_ERROR when mounting and unsuccessfully downloading previews", () => {
    const storage = createStorage();
    const [state] = renderHook(
      () => useDashboard(),
      (UseDashboard) => (
        <EnvironmentProvider
          environment={{
            authentication: createAuthentication(),
            storage,
          }}
        >
          <DashboardFeature>
            <UseDashboard />
          </DashboardFeature>
        </EnvironmentProvider>
      )
    );

    expect(storage.fetchPreviews).toBeCalled();

    act(() => {
      storage.subscription.emit({
        type: "STORAGE:FETCH_PREVIEWS_ERROR",
        error: "Unable to download",
      });
    });

    expect(state).toEqual<DashboardState>({
      state: "PREVIEWS_ERROR",
      error: "Unable to download",
    });
  });
});
