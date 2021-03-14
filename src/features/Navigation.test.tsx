import React from "react";
import renderer from "react-test-renderer";
import { NavigationProvider } from "./Navigation";
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
    const Assert = () => {
      return null;
    };

    renderer.act(() => {
      renderer.create(
        <ExternalsProvider
          externals={{
            router: RouterMock,
          }}
        >
          <NavigationProvider>
            <Assert />
          </NavigationProvider>
        </ExternalsProvider>
      );
    });

    expect(routes).toEqual(["/", "/:userId/:id"]);
  });
});
