import * as React from "react";
import { act, render, waitFor } from "@testing-library/react";
import { Environment } from "../environment";
import { createStorage } from "../environment/storage/test";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import {
  DashboardContext,
  DashboardFeature,
  DashboardStates,
  useDashboard,
} from "./Dashboard";
import { AuthFeature } from "./Auth";

describe("Dashboard", () => {
  test("Should go to PREVIEWS_LOADED when mounting and successfully downloading previews", async () => {
    const storage = createStorage();

    let dashboardFeature!: DashboardStates;
    const DashboardFeatureConsumer = () => {
      dashboardFeature = useDashboard();

      return null;
    };

    render(
      <Environment
        environment={{
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
            <DashboardFeatureConsumer />
          </DashboardFeature>
        </AuthFeature>
      </Environment>
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

    storage.getPreviews.ok({
      "123": mockedPreviews,
    });

    await waitFor(() =>
      expect(dashboardFeature.context).toEqual<DashboardContext>({
        state: "PREVIEWS_LOADED",
        showCount: 10,
        excalidraws: {
          "123": mockedPreviews,
        },
      })
    );
  });
  test("Should go to PREVIEWS_ERROR when mounting and unsuccessfully downloading previews", async () => {
    const storage = createStorage();

    let dashboardFeature!: DashboardStates;
    const DashboardFeatureConsumer = () => {
      dashboardFeature = useDashboard();

      return null;
    };

    render(
      <Environment
        environment={{
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
            <DashboardFeatureConsumer />
          </DashboardFeature>
        </AuthFeature>
      </Environment>
    );

    storage.getPreviews.err("ERROR", "Unable to download");

    await waitFor(() =>
      expect(dashboardFeature.context).toEqual<DashboardContext>({
        state: "PREVIEWS_ERROR",
        error: "Unable to download",
      })
    );
  });
  test("Should go to EXCALIDRAW_CREATED when creating a new Excalidraw successfully", async () => {
    const storage = createStorage();
    const history = createMemoryHistory();

    let dashboardFeature!: DashboardStates;
    const DashboardFeatureConsumer = () => {
      dashboardFeature = useDashboard();

      return null;
    };

    render(
      <Environment
        environment={{
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
              <DashboardFeatureConsumer />
            </DashboardFeature>
          </AuthFeature>
        </Router>
      </Environment>
    );

    act(() => {
      dashboardFeature.dispatch({ type: "CREATE_EXCALIDRAW" });
    });

    expect(dashboardFeature.context).toEqual<DashboardContext>({
      state: "CREATING_EXCALIDRAW",
      excalidraws: {},
      showCount: 10,
    });

    storage.createExcalidraw.ok("456");

    await waitFor(() =>
      expect(dashboardFeature.context).toEqual<DashboardContext>({
        state: "EXCALIDRAW_CREATED",
        id: "456",
      })
    );

    expect(history.entries[1].pathname).toBe("/123/456");
  });
  test("Should go to CREATE_EXCALIDRAW_ERROR when creating a new Excalidraw unsuccessfully", async () => {
    const storage = createStorage();

    let dashboardFeature!: DashboardStates;
    const DashboardFeatureConsumer = () => {
      dashboardFeature = useDashboard();

      return null;
    };

    render(
      <Environment
        environment={{
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
            <DashboardFeatureConsumer />
          </DashboardFeature>
        </AuthFeature>
      </Environment>
    );

    act(() => {
      dashboardFeature.dispatch({ type: "CREATE_EXCALIDRAW" });
    });

    expect(dashboardFeature.context).toEqual<DashboardContext>({
      state: "CREATING_EXCALIDRAW",
      excalidraws: {},
      showCount: 10,
    });

    storage.createExcalidraw.err("ERROR", "Could not create Excalidraw");

    await waitFor(() =>
      expect(dashboardFeature.context).toEqual<DashboardContext>({
        state: "CREATE_EXCALIDRAW_ERROR",
        error: "Could not create Excalidraw",
        excalidraws: {},
        showCount: 10,
      })
    );
  });
});
