import React from "react";
import renderer from "react-test-renderer";
import { NavigationProvider, useNavigation } from "./Navigation";
import { EnvironmentProvider } from "../environment";
import { createRouterMock } from "../environment/test/router";

describe("Navigation", () => {
  test("Should register routes", () => {
    const router = createRouterMock();

    renderer.act(() => {
      renderer.create(
        <EnvironmentProvider
          environment={{
            router,
          }}
        >
          <NavigationProvider>{null}</NavigationProvider>
        </EnvironmentProvider>
      );
    });

    expect(Object.keys(router.routes)).toEqual(["/", "/:userId/:id"]);
  });
  test("Should change to dashboard when url triggers ", () => {
    const router = createRouterMock();
    let navigation!: ReturnType<typeof useNavigation>;
    const NavigationExposer = () => {
      navigation = useNavigation();
      return null;
    };

    renderer.act(() => {
      renderer.create(
        <EnvironmentProvider
          environment={{
            router,
          }}
        >
          <NavigationProvider>
            <NavigationExposer />
          </NavigationProvider>
        </EnvironmentProvider>
      );
    });

    renderer.act(() => {
      router.routes["/"]();
    });

    expect(navigation.is("DASHBOARD"));
  });
});
