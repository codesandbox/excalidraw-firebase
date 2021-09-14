import React from "react";
import { renderHook } from "react-states/test";
import { act } from "@testing-library/react";
import { EnvironmentProvider } from "../../environment";
import { useAuth, AuthProvider, AuthState } from ".";
import { createAuthentication } from "../../environment/authentication/test";

describe("Auth", () => {
  test("Should go to AUTHENTICATED when mounted and is logged in", () => {
    const authentication = createAuthentication();
    const [state] = renderHook(
      () => useAuth(),
      (UseAuth) => (
        <EnvironmentProvider
          environment={{
            authentication,
          }}
        >
          <AuthProvider>
            <UseAuth />
          </AuthProvider>
        </EnvironmentProvider>
      )
    );

    act(() => {
      authentication.subscription.emit({
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
    const authentication = createAuthentication();

    const [state] = renderHook(
      () => useAuth(),
      (UseAuth) => (
        <EnvironmentProvider
          environment={{
            authentication,
          }}
        >
          <AuthProvider>
            <UseAuth />
          </AuthProvider>
        </EnvironmentProvider>
      )
    );

    act(() => {
      authentication.subscription.emit({
        type: "AUTHENTICATION:UNAUTHENTICATED",
      });
    });

    expect(state).toEqual<AuthState>({
      state: "UNAUTHENTICATED",
    });
  });
  test("Should go to AUTHENTICATED when signing in successfully", () => {
    const authentication = createAuthentication();

    const [state, dispatch] = renderHook(
      () => useAuth(),
      (UseAuth) => (
        <EnvironmentProvider
          environment={{
            authentication,
          }}
        >
          <AuthProvider
            initialState={{
              state: "UNAUTHENTICATED",
            }}
          >
            <UseAuth />
          </AuthProvider>
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
    expect(authentication.signIn).toBeCalled();

    act(() => {
      authentication.subscription.emit({
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
    const authentication = createAuthentication();
    const [state, dispatch] = renderHook(
      () => useAuth(),
      (UseAuth) => (
        <EnvironmentProvider
          environment={{
            authentication,
          }}
        >
          <AuthProvider
            initialState={{
              state: "UNAUTHENTICATED",
            }}
          >
            <UseAuth />
          </AuthProvider>
        </EnvironmentProvider>
      )
    );

    act(() => {
      dispatch({
        type: "SIGN_IN",
      });
    });

    expect(state.state).toBe("SIGNING_IN");
    expect(authentication.signIn).toBeCalled();

    act(() => {
      authentication.subscription.emit({
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
