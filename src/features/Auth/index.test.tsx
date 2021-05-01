import React from "react";
import { renderHook } from "react-states/cjs/test";
import { act, waitFor } from "@testing-library/react";
import { Environment } from "../../environment";
import { useAuth, AuthFeature, AuthContext } from ".";
import { createAuth } from "../../environment/auth/test";

describe("Auth", () => {
  test("Should go to AUTHENTICATED when mounted and is logged in", async () => {
    const auth = createAuth();
    const [context] = renderHook(
      () => useAuth(),
      (UseAuth) => (
        <Environment
          environment={{
            auth,
          }}
        >
          <AuthFeature>
            <UseAuth />
          </AuthFeature>
        </Environment>
      )
    );

    auth.onAuthChange.trigger({
      avatarUrl: "",
      name: "Karen",
      uid: "123",
    });

    await waitFor(() =>
      expect(context).toEqual({
        state: "AUTHENTICATED",
        user: {
          avatarUrl: "",
          name: "Karen",
          uid: "123",
        },
      })
    );
  });
  test("Should go to UNAUTHENTICATED when mounted and is not logged in", async () => {
    const auth = createAuth();

    const [context] = renderHook(
      () => useAuth(),
      (UseAuth) => (
        <Environment
          environment={{
            auth,
          }}
        >
          <AuthFeature>
            <UseAuth />
          </AuthFeature>
        </Environment>
      )
    );

    auth.onAuthChange.trigger(null);

    await waitFor(() =>
      expect(context).toEqual<AuthContext>({
        state: "UNAUTHENTICATED",
      })
    );
  });
  test("Should go to AUTHENTICATED when signing in successfully", async () => {
    const auth = createAuth();

    const [context, dispatch] = renderHook(
      () => useAuth(),
      (UseAuth) => (
        <Environment
          environment={{
            auth,
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

    auth.signIn.ok({
      avatarUrl: "",
      name: "Karen",
      uid: "123",
    });

    await waitFor(() =>
      expect(context).toEqual<AuthContext>({
        state: "AUTHENTICATED",
        user: {
          avatarUrl: "",
          name: "Karen",
          uid: "123",
        },
      })
    );
  });
  test("Should go to ERROR when signing in unsuccsessfully", async () => {
    const auth = createAuth();
    const [context, dispatch] = renderHook(
      () => useAuth(),
      (UseAuth) => (
        <Environment
          environment={{
            auth,
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

    auth.signIn.err("NOT_SIGNED_IN");

    await waitFor(() =>
      expect(context).toEqual<AuthContext>({
        state: "ERROR",
        error: "Authenticated, but no user",
      })
    );
  });
});
