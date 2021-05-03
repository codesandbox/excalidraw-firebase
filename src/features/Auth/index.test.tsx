import React from "react";
import { renderHook } from "react-states/test";
import { act, waitFor } from "@testing-library/react";
import { Environment } from "../../environment";
import { useAuth, AuthFeature, AuthContext } from ".";
import { createAuthentication } from "../../environment/authentication/test";

describe("Auth", () => {
  test("Should go to AUTHENTICATED when mounted and is logged in", () => {
    const authentication = createAuthentication();
    const [context] = renderHook(
      () => useAuth(),
      (UseAuth) => (
        <Environment
          environment={{
            authentication,
          }}
        >
          <AuthFeature>
            <UseAuth />
          </AuthFeature>
        </Environment>
      )
    );

    act(() => {
      authentication.events.emit({
        type: "AUTHENTICATION:AUTHENTICATED",
        user: {
          avatarUrl: "",
          name: "Karen",
          uid: "123",
        },
      });
    });

    expect(context).toEqual({
      state: "AUTHENTICATED",
      user: {
        avatarUrl: "",
        name: "Karen",
        uid: "123",
      },
    });
  });
  test("Should go to UNAUTHENTICATED when mounted and is not logged in", () => {
    const authentication = createAuthentication();

    const [context] = renderHook(
      () => useAuth(),
      (UseAuth) => (
        <Environment
          environment={{
            authentication,
          }}
        >
          <AuthFeature>
            <UseAuth />
          </AuthFeature>
        </Environment>
      )
    );

    act(() => {
      authentication.events.emit({
        type: "AUTHENTICATION:UNAUTHENTICATED",
      });
    });

    expect(context).toEqual<AuthContext>({
      state: "UNAUTHENTICATED",
    });
  });
  test("Should go to AUTHENTICATED when signing in successfully", () => {
    const authentication = createAuthentication();

    const [context, dispatch] = renderHook(
      () => useAuth(),
      (UseAuth) => (
        <Environment
          environment={{
            authentication,
          }}
        >
          <AuthFeature
            initialContext={{
              state: "UNAUTHENTICATED",
            }}
          >
            <UseAuth />
          </AuthFeature>
        </Environment>
      )
    );

    act(() => {
      dispatch({
        type: "SIGN_IN",
      });
    });

    expect(context.state).toBe("SIGNING_IN");
    expect(authentication.signIn).toBeCalled();

    act(() => {
      authentication.events.emit({
        type: "AUTHENTICATION:AUTHENTICATED",
        user: {
          avatarUrl: "",
          name: "Karen",
          uid: "123",
        },
      });
    });

    expect(context).toEqual<AuthContext>({
      state: "AUTHENTICATED",
      user: {
        avatarUrl: "",
        name: "Karen",
        uid: "123",
      },
    });
  });
  test("Should go to ERROR when signing in unsuccsessfully", () => {
    const authentication = createAuthentication();
    const [context, dispatch] = renderHook(
      () => useAuth(),
      (UseAuth) => (
        <Environment
          environment={{
            authentication,
          }}
        >
          <AuthFeature
            initialContext={{
              state: "UNAUTHENTICATED",
            }}
          >
            <UseAuth />
          </AuthFeature>
        </Environment>
      )
    );

    act(() => {
      dispatch({
        type: "SIGN_IN",
      });
    });

    expect(context.state).toBe("SIGNING_IN");
    expect(authentication.signIn).toBeCalled();

    act(() => {
      authentication.events.emit({
        type: "AUTHENTICATION:SIGN_IN_ERROR",
        error: "Something bad happened",
      });
    });

    expect(context).toEqual<AuthContext>({
      state: "ERROR",
      error: "Something bad happened",
    });
  });
});
