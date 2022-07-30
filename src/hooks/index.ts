import { createHooksProvider } from "react-hooks-provider";
import { AuthState } from "./useAuth";

type Props = {
  authState?: AuthState;
};

const { Provider, registerHook } = createHooksProvider<Props>();

export { Provider, registerHook };
