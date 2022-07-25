import React from "react";
import { renderReducer } from "react-states/test";
import { act } from "@testing-library/react";
import { useAuth, AuthState } from "./useAuth";
import { createTestEnvironment } from "../environments/test";
import { EnvironmentProvider } from "../environment-interface";

describe("Auth", () => {
  test("Should go to AUTHENTICATED when mounted and is logged in", () => {
    const environment = createTestEnvironment();
    const [state] = renderReducer(
      () => useAuth(),
      (UseAuth) => (
        <EnvironmentProvider environment={environment}>
          <UseAuth />
        </EnvironmentProvider>
      )
    );

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

    expect(state).toEqual<AuthState>({
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
    const [state] = renderReducer(
      () => useAuth(),
      (UseAuth) => (
        <EnvironmentProvider environment={environment}>
          <UseAuth />
        </EnvironmentProvider>
      )
    );

    act(() => {
      environment.authentication.emit({
        type: "AUTHENTICATION:UNAUTHENTICATED",
      });
    });

    expect(state).toEqual<AuthState>({
      state: "UNAUTHENTICATED",
    });
  });
  test("Should go to AUTHENTICATED when signing in successfully", () => {
    const environment = createTestEnvironment();

    const [state, dispatch] = renderReducer(
      () =>
        useAuth({
          state: "UNAUTHENTICATED",
        }),
      (UseAuth) => (
        <EnvironmentProvider environment={environment}>
          <UseAuth />
        </EnvironmentProvider>
      )
    );

    act(() => {
      dispatch({
        type: "SIGN_IN",
      });
    });

    expect(state.state).toEqual<AuthState>({
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

    expect(state).toEqual<AuthState>({
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
    const [state, dispatch] = renderReducer(
      () =>
        useAuth({
          state: "UNAUTHENTICATED",
        }),
      (UseAuth) => (
        <EnvironmentProvider environment={environment}>
          <UseAuth />
        </EnvironmentProvider>
      )
    );

    act(() => {
      dispatch({
        type: "SIGN_IN",
      });
    });

    expect(state.state).toBe("SIGNING_IN");
    expect(environment.authentication.signIn).toBeCalled();

    act(() => {
      environment.authentication.emit({
        type: "AUTHENTICATION:SIGN_IN_ERROR",
        error: "Something bad happened",
      });
    });

    expect(state).toEqual<AuthState>({
      state: "ERROR",
      error: "Something bad happened",
    });
  });
});
