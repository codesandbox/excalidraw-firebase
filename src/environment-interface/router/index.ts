import { TEmit, TSubscribe } from "react-environment-interface";

export type NotFoundPage = {
  name: "NOT_FOUND";
};

export type Page =
  | {
      name: "ALL_EXCALIDRAWS";
    }
  | {
      name: "USER_EXCALIDRAWS";
      userId: string;
    }
  | {
      name: "EXCALIDRAW";
      userId: string;
      excalidrawId: string;
    };

export type RouterEvent = {
  type: "PAGE_CHANGED";
  page: Page | NotFoundPage;
};

export interface Router {
  emit: TEmit<RouterEvent>;
  subscribe: TSubscribe<RouterEvent>;
  page: Page | NotFoundPage;
  open: (page: Page) => void;
}
