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
    setState({ name: "ALL_EXCALIDRAWS" });
  });

  router("/:userId", ({ params }) => {
    setState({ name: "USER_EXCALIDRAWS", userId: params.userId });
  });

  router("/:userId/:excalidrawId", ({ params }) => {
    setState({
      name: "EXCALIDRAW",
      userId: params.userId,
      excalidrawId: params.excalidrawId,
    });
  });

  router("*", () => {
    setState({ name: "NOT_FOUND" });
  });

  router.start();

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
