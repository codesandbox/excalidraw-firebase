import { createHook } from "async_hooks";
import { createHooksProvider } from "react-hooks-provider";
import { AuthState } from "./useAuth";
import { NavigationState } from "./useNavigation";

type Props = {
  authState?: AuthState;
  navigationState?: NavigationState;
};

const { Provider, registerHook } = createHooksProvider<Props>();

export { Provider, registerHook };
