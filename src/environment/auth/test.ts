import { createResultMock, ResultMock } from "react-states";
import { Auth, User } from ".";

const createOnAuthChangeMock = () => {
  let registeredCallback: (user: User | null) => void;
  const onAuthChangeMock: Auth["onAuthChange"] & {
    trigger: (user: User | null) => void;
  } = (cb) => {
    registeredCallback = cb;
    return () => {};
  };

  onAuthChangeMock.trigger = (user) => {
    Promise.resolve().then(() => {
      registeredCallback(user);
    });
  };

  return onAuthChangeMock;
};

export const createAuth = (): Auth & {
  signIn: ResultMock<Auth["signIn"]>;
  onAuthChange: ReturnType<typeof createOnAuthChangeMock>;
} => {
  return {
    signIn: createResultMock(),
    onAuthChange: createOnAuthChangeMock(),
  };
};
