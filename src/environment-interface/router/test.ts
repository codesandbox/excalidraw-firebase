import { createEmitter } from "react-environment-interface";
import { Router, RouterPage } from ".";

export const createRouter = (initialPage: RouterPage): Router => ({
  ...createEmitter(),
  page: initialPage,
  open: jest.fn(),
});
