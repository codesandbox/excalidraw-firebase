import * as React from "react";
import { act } from "@testing-library/react";

import { createStorage } from "../../environments/storage/test";
import { createAuthentication } from "../../environments/authentication/test";
import { createTestEnvironment } from "../../environments/test";
import { DashboardState, useDashboard } from "./useDashboard";
import { EnvironmentProvider } from "../../environment-interface";
import { renderReducer } from "react-states/test";

describe("Dashboard", () => {
  test("Should go to PREVIEWS_LOADED when mounting and successfully downloading previews", () => {
    const environment = createTestEnvironment();

    const [state] = renderReducer(
      () => [useDashboard(), () => {}],
      (UseDashboard) => (
        <EnvironmentProvider environment={environment}>
          <UseDashboard />
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

    expect(environment.storage.fetchPreviews).toBeCalled();

    act(() => {
      environment.storage.emit({
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
    const environment = createTestEnvironment();
    const [state] = renderReducer(
      () => [useDashboard(), () => {}],
      (UseDashboard) => (
        <EnvironmentProvider environment={environment}>
          <UseDashboard />
        </EnvironmentProvider>
      )
    );

    expect(environment.storage.fetchPreviews).toBeCalled();

    act(() => {
      environment.storage.emit({
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
