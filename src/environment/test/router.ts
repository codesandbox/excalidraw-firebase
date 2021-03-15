import { Router } from "../interfaces";

type Routes = { [url: string]: Function };

export const createRouterMock = (): Router & { routes: Routes } => {
  const routes: Routes = {};
  return {
    routes,
    navigate() {},
    on(url, cb) {
      routes[url] = cb;
    },
    resolve() {},
  };
};
