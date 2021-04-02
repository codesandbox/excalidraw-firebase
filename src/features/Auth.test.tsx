import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { Environment } from "../environment";
import { AuthStates, useAuth, AuthFeature, AuthContext } from "./Auth";
import { createAuth } from "../environment/auth/test";

describe("Auth", () => {
  test("Should go to AUTHENTICATED when mounted and is logged in", async () => {
    const auth = createAuth();
    let authFeature!: AuthStates;
    const AuthFeatureConsumer = () => {
      authFeature = useAuth();

      return null;
    };

    render(
      <Environment
        environment={{
          auth,
        }}
      >
        <AuthFeature>
          <AuthFeatureConsumer />
        </AuthFeature>
      </Environment>
    );

    auth.onAuthChange.trigger({
      avatarUrl: "",
      name: "Karen",
      uid: "123",
    });

    await waitFor(() =>
      expect(authFeature.context).toEqual({
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
    let authFeature!: AuthStates;
    const AuthFeatureConsumer = () => {
      authFeature = useAuth();

      return null;
    };

    render(
      <Environment
        environment={{
          auth,
        }}
      >
        <AuthFeature>
          <AuthFeatureConsumer />
        </AuthFeature>
      </Environment>
    );

    auth.onAuthChange.trigger(null);

    await waitFor(() =>
      expect(authFeature.context).toEqual<AuthContext>({
        state: "UNAUTHENTICATED",
      })
    );
  });
  test("Should go to AUTHENTICATED when signing in successfully", async () => {
    const auth = createAuth();
    let authFeature!: AuthStates;
    const AuthFeatureConsumer = () => {
      authFeature = useAuth();

      return null;
    };

    render(
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
          <AuthFeatureConsumer />
        </AuthFeature>
      </Environment>
    );

    act(() => {
      authFeature.dispatch({
        type: "SIGN_IN",
      });
    });

    expect(authFeature.context.state).toBe("SIGNING_IN");

    auth.signIn.ok({
      avatarUrl: "",
      name: "Karen",
      uid: "123",
    });

    await waitFor(() =>
      expect(authFeature.context).toEqual<AuthContext>({
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

    let authFeature!: AuthStates;
    const AuthFeatureConsumer = () => {
      authFeature = useAuth();

      return null;
    };

    render(
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
          <AuthFeatureConsumer />
        </AuthFeature>
      </Environment>
    );

    act(() => {
      authFeature.dispatch({
        type: "SIGN_IN",
      });
    });

    expect(authFeature.context.state).toBe("SIGNING_IN");

    auth.signIn.err("NOT_SIGNED_IN");

    await waitFor(() =>
      expect(authFeature.context).toEqual<AuthContext>({
        state: "ERROR",
        error: "Authenticated, but no user",
      })
    );
  });
});
