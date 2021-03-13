import React from "react";
import renderer from "react-test-renderer";
import { Navigation } from "./Navigation";
import { ExternalsProvider } from "../externals";
import { Router } from "../externals/interfaces";

describe("Navigation", () => {
  test("Should register routes", () => {
    const routes: string[] = [];
    const RouterMock: Router = {
      on(url) {
        routes.push(url);
      },
      resolve() {},
      navigate() {},
    };

    renderer.act(() => {
      renderer.create(
        <ExternalsProvider
          externals={{
            router: RouterMock,
          }}
        >
          <Navigation />
        </ExternalsProvider>
      );
    });

    expect(routes).toEqual(["/", "/:userId/:id"]);
  });
});
