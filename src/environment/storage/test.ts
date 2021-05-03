import { createResultMock, events } from "react-states";
import { ExcalidrawData, Storage } from ".";

type CreateSubscriptionMock = Storage["subscribeToChanges"] & {
  trigger: (data: ExcalidrawData) => void;
};

function createSubscriptionMock(): CreateSubscriptionMock {
  let cb: any;
  const subscriptionMock: CreateSubscriptionMock = (userId, id, listener) => {
    cb = listener;
    return () => {};
  };

  subscriptionMock.trigger = (data) => {
    cb(data);
  };

  return subscriptionMock;
}

export const createStorage = (): Storage => ({
  events: events(),
  createExcalidraw: jest.fn(),
  fetchExcalidraw: jest.fn(),
  fetchPreviews: jest.fn,
  saveExcalidraw: jest.fn(),
  saveImage: createResultMock<Storage["saveImage"]>(),
  getImageSrc: createResultMock<Storage["getImageSrc"]>(),
  hasExcalidrawUpdated: createResultMock<Storage["hasExcalidrawUpdated"]>(),
  subscribeToChanges: createSubscriptionMock(),
});
