import React from "react";
import renderer from "react-test-renderer";
import { NavigationProvider } from "./Navigation";
import { EnvironmentProvider } from "../environment";
import { Router } from "../environment/interfaces";

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
        <EnvironmentProvider
          environment={{
            router: RouterMock,
          }}
        >
          <NavigationProvider>
            <Assert />
          </NavigationProvider>
        </EnvironmentProvider>
      );
    });

    expect(routes).toEqual(["/", "/:userId/:id"]);
  });
});
