import { TEmit, TSubscribe } from "react-environment-interface";

export type RouterPage =
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
    }
  | {
      name: "NOT_FOUND";
    };

export type RouterEvent = {
  type: "ROUTER:PAGE_CHANGED";
  page: RouterPage;
};

export interface Router {
  emit: TEmit<RouterEvent>;
  subscribe: TSubscribe<RouterEvent>;
  page: RouterPage;
  open: (page: RouterPage) => void;
}
