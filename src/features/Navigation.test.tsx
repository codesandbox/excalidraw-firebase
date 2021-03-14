import React from "react";
import renderer from "react-test-renderer";
import { NavigationProvider, useNavigation } from "./Navigation";
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

    renderer.act(() => {
      renderer.create(
        <EnvironmentProvider
          environment={{
            router: RouterMock,
          }}
        >
          <NavigationProvider>{null}</NavigationProvider>
        </EnvironmentProvider>
      );
    });

    expect(routes).toEqual(["/", "/:userId/:id"]);
  });
  test("Should change to dashboard when url triggers ", () => {
    const routes: { [url: string]: Function } = {};
    const RouterMock: Router = {
      on(url, cb) {
        routes[url] = cb;
      },
      resolve() {},
      navigate() {},
    };
    let navigation!: ReturnType<typeof useNavigation>;
    const NavigationExposer = () => {
      navigation = useNavigation();
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
            <NavigationExposer />
          </NavigationProvider>
        </EnvironmentProvider>
      );
    });

    renderer.act(() => {
      routes["/"]();
    });

    expect(navigation.is("DASHBOARD"));
  });
});
