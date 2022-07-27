import { createHooksProvider } from "react-hooks-provider";
import { AuthState } from "./useAuth";
import { NavigationState } from "./useCreateExcalidraw";

type Props = {
  authState?: AuthState;
  navigationState?: NavigationState;
};

const { Provider, registerHook } = createHooksProvider<Props>();

export { Provider, registerHook };
