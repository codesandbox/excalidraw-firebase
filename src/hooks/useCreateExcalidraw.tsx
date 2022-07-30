import { useEnvironment } from "../environment-interface";
import { useStateTransition, useLazyPromise } from "react-states";

import { useAuthenticatedAuth } from "./useAuth";

export const useCreateExcalidraw = () => {
  const auth = useAuthenticatedAuth();
  const { storage, router } = useEnvironment();
  const createExcalidraw = useLazyPromise(
    () => storage.createExcalidraw(auth.user.uid),
    [auth.user.uid]
  );

  const [state] = createExcalidraw;

  useStateTransition(
    state,
    "RESOLVED",
    ({ value: id }) => {
      router.open({
        name: "EXCALIDRAW",
        userId: auth.user.uid,
        excalidrawId: id,
      });
    },
    [auth.user.uid]
  );

  return createExcalidraw;
};
