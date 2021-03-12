import React, { createContext, useContext } from "react";

export interface Router {
  on<T extends { [key: string]: string }>(
    route: string,
    cb: (params: T) => void
  ): void;
  navigate(url: string): void;
  resolve(): void;
}

const routerContext = createContext({} as Router);

export const useRouter = () => useContext(routerContext);

export const RouterProvider = ({
  children,
  router,
}: {
  children: React.ReactNode;
  router: Router;
}) => (
  <routerContext.Provider value={router}>{children}</routerContext.Provider>
);
