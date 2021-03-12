import React from "react";
import renderer from "react-test-renderer";
import { Navigation } from "./Navigation";
import { RouterProvider } from "../providers/RouterProvider";

describe("Navigation", () => {
  test("Should register routes", () => {
    const routes: string[] = [];

    renderer.act(() => {
      renderer.create(
        <RouterProvider
          router={{
            on(url) {
              routes.push(url);
            },
            resolve() {},
            navigate() {},
          }}
        >
          <Navigation />
        </RouterProvider>
      );
    });

    expect(routes).toEqual(["/", "/:userId/:id"]);
  });
});
