import { createResultMock, ResultMock } from "react-states";
import { ExcalidrawElement, Storage } from ".";

type CreateSubscriptionMock = Storage["subscribeToChanges"] & {
  trigger: (elements: ExcalidrawElement[]) => void;
};

function createSubscriptionMock(): CreateSubscriptionMock {
  let cb: any;
  const subscriptionMock: CreateSubscriptionMock = (userId, id, listener) => {
    cb = listener;
    return () => {};
  };

  subscriptionMock.trigger = (elements) => {
    cb({ elements });
  };

  return subscriptionMock;
}

export const createStorage = () => ({
  createExcalidraw: createResultMock<Storage["createExcalidraw"]>(),
  getExcalidraw: createResultMock<Storage["getExcalidraw"]>(),
  getPreviews: createResultMock<Storage["getPreviews"]>(),
  saveExcalidraw: createResultMock<Storage["saveExcalidraw"]>(),
  saveImage: createResultMock<Storage["saveImage"]>(),
  getImageSrc: createResultMock<Storage["getImageSrc"]>(),
  hasExcalidrawUpdated: createResultMock<Storage["hasExcalidrawUpdated"]>(),
  subscribeToChanges: createSubscriptionMock(),
});
