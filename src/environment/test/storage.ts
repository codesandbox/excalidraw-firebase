import { ExcalidrawStorage } from "../interfaces";

export const createStorageMock = (definition: Partial<ExcalidrawStorage>) =>
  Object.assign(
    {
      createExcalidraw: async () => "123",
      getExcalidraw: async (userId: string, id: string) => ({
        data: { elements: [], appState: {}, version: 0 },
        metadata: { author: userId, last_updated: new Date(), id },
      }),
      getPreviews: async () => [],
      saveExcalidraw: async () => {},
      saveImage: async () => {},
    } as ExcalidrawStorage,
    definition
  );
