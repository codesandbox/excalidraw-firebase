import { Subscription } from "react-states";

export type User = {
  uid: string;
  name: string;
  avatarUrl: string | null;
};

export type AuthenticationAction =
  | {
      type: "AUTHENTICATION:AUTHENTICATED";
      user: User;
      loomApiKey: string | null;
    }
  | {
      type: "AUTHENTICATION:UNAUTHENTICATED";
    }
  | {
      type: "AUTHENTICATION:SIGN_IN_ERROR";
      error: string;
    };

export interface Authentication {
  subscription: Subscription<AuthenticationAction>;
  signIn(): void;
}
