import { createEmitter } from "react-environment-interface";
import { Router, Page } from ".";

export const createRouter = (initialPage: Page): Router => ({
  ...createEmitter(),
  page: initialPage,
  open: jest.fn(),
});
