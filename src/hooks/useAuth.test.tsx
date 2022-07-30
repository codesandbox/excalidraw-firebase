import React from "react";
import { act, renderHook } from "@testing-library/react-hooks";
import { useAuth, AuthState } from "./useAuth";
import { createTestEnvironment } from "../environment-interface/test";
import { EnvironmentProvider } from "../environment-interface";
import { Provider } from ".";

describe("Auth", () => {
  test("Should go to AUTHENTICATED when mounted and is logged in", () => {
    const environment = createTestEnvironment();
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <EnvironmentProvider environment={environment}>
          <Provider>{children}</Provider>
        </EnvironmentProvider>
      ),
    });

    act(() => {
      environment.authentication.emit({
        type: "AUTHENTICATION:AUTHENTICATED",
        user: {
          avatarUrl: "",
          name: "Karen",
          uid: "123",
        },
        loomApiKey: "",
      });
    });

    expect(result.current[0]).toEqual<AuthState>({
      state: "AUTHENTICATED",
      user: {
        avatarUrl: "",
        name: "Karen",
        uid: "123",
      },
      loomApiKey: "",
    });
  });
  test("Should go to UNAUTHENTICATED when mounted and is not logged in", () => {
    const environment = createTestEnvironment();
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <EnvironmentProvider environment={environment}>
          <Provider>{children}</Provider>
        </EnvironmentProvider>
      ),
    });

    act(() => {
      environment.authentication.emit({
        type: "AUTHENTICATION:UNAUTHENTICATED",
      });
    });

    expect(result.current[0]).toEqual<AuthState>({
      state: "UNAUTHENTICATED",
    });
  });
  test("Should go to AUTHENTICATED when signing in successfully", () => {
    const environment = createTestEnvironment();

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <EnvironmentProvider environment={environment}>
          <Provider
            authState={{
              state: "UNAUTHENTICATED",
            }}
          >
            {children}
          </Provider>
        </EnvironmentProvider>
      ),
    });

    act(() => {
      result.current[1]({
        type: "SIGN_IN",
      });
    });

    expect(result.current[0].state).toEqual<AuthState>({
      state: "SIGNING_IN",
    });
    expect(environment.authentication.signIn).toBeCalled();

    act(() => {
      environment.authentication.emit({
        type: "AUTHENTICATION:AUTHENTICATED",
        user: {
          avatarUrl: "",
          name: "Karen",
          uid: "123",
        },
        loomApiKey: "",
      });
    });

    expect(result.current[0]).toEqual<AuthState>({
      state: "AUTHENTICATED",
      user: {
        avatarUrl: "",
        name: "Karen",
        uid: "123",
      },
      loomApiKey: "",
    });
  });
  test("Should go to ERROR when signing in unsuccsessfully", () => {
    const environment = createTestEnvironment();
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <EnvironmentProvider environment={environment}>
          <Provider
            authState={{
              state: "UNAUTHENTICATED",
            }}
          >
            {children}
          </Provider>
        </EnvironmentProvider>
      ),
    });

    act(() => {
      result.current[1]({
        type: "SIGN_IN",
      });
    });

    expect(result.current[0].state).toBe("SIGNING_IN");
    expect(environment.authentication.signIn).toBeCalled();

    act(() => {
      environment.authentication.emit({
        type: "AUTHENTICATION:SIGN_IN_ERROR",
        error: "Something bad happened",
      });
    });

    expect(result.current[0]).toEqual<AuthState>({
      state: "ERROR",
      error: "Something bad happened",
    });
  });
});
