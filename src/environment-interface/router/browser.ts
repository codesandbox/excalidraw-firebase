import router from "page";
import { createEmitter } from "react-environment-interface";
import { Router, RouterEvent, RouterPage } from ".";

export const createRouter = (): Router => {
  const { emit, subscribe } = createEmitter<RouterEvent>();
  let currentPage: RouterPage;

  function setState(page: RouterPage) {
    currentPage = page;
    emit({
      type: "ROUTER:PAGE_CHANGED",
      page,
    });
  }

  router("/", () => {
    setState({ state: "ALL_EXCALIDRAWS" });
  });

  router("/:userId", ({ params }) => {
    setState({ state: "USER_EXCALIDRAWS", userId: params.userId });
  });

  router("/:userId/:excalidrawId", ({ params }) => {
    setState({
      state: "EXCALIDRAW",
      userId: params.userId,
      excalidrawId: params.excalidrawId,
    });
  });

  router("*", () => {
    setState({ state: "NOT_FOUND" });
  });

  page.start();

  return {
    emit,
    subscribe,
    get page() {
      return currentPage;
    },
    open(page) {
      switch (page.name) {
        case "ALL_EXCALIDRAWS":
          return router("/");
        case "USER_EXCALIDRAWS":
          return router(`/${page.userId}`);
        case "EXCALIDRAW":
          return router(`/${page.userId}/${page.excalidrawId}`);
      }
    },
  };
};
