import { useEffect, useState } from "react";
import { useEnvironment } from "../environment-interface";

export const useRouter = () => {
  const { router } = useEnvironment();
  const [, setState] = useState(router.page);

  useEffect(() => router.subscribe((event) => setState(event.page)), []);

  return router;
};
