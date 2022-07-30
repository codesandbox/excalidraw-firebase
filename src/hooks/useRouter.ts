import { useEffect, useState } from "react";
import { registerHook } from ".";
import { useEnvironment } from "../environment-interface";

export const useRouter = registerHook(() => {
  const { router } = useEnvironment();
  const [, setState] = useState(router.page);

  useEffect(() => router.subscribe((event) => setState(event.page)), []);

  return router;
});
