import Navigo from "navigo";
import { Router } from "./types";

const navigo = new Navigo("/");

export const router: Router = {
  on: (url, cb) => {
    navigo.on(url, ({ data }) => cb(data || ({} as any)));
  },
  resolve: () => navigo.resolve(),
  navigate: (url) => navigo.navigate(url),
};
