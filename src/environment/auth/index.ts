import { Result } from "react-states";

export type SignInError =
  | {
      type: "NOT_SIGNED_IN";
    }
  | {
      type: "ERROR";
      data: Error;
    };

export type User = {
  uid: string;
  name: string;
  avatarUrl: string | null;
};

export interface Auth {
  signIn(): Result<User, SignInError>;
  onAuthChange(cb: (user: User | null) => void): () => void;
}
