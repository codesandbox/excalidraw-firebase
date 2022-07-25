import router from "page";
import { createEmitter } from "react-environment-interface";
import { Router, RouterEvent, NotFoundPage, Page } from ".";

export const createRouter = (): Router => {
  const { emit, subscribe } = createEmitter<RouterEvent>();
  let currentPage: Page | NotFoundPage;

  function setPage(page: Page | NotFoundPage) {
    currentPage = page;
    emit({
      type: "PAGE_CHANGED",
      page,
    });
  }

  router("/", () => {
    setPage({ name: "ALL_EXCALIDRAWS" });
  });

  router("/:userId", ({ params }) => {
    setPage({ name: "USER_EXCALIDRAWS", userId: params.userId });
  });

  router("/:userId/:excalidrawId", ({ params }) => {
    setPage({
      name: "EXCALIDRAW",
      userId: params.userId,
      excalidrawId: params.excalidrawId,
    });
  });

  router("*", () => {
    setPage({ name: "NOT_FOUND" });
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
