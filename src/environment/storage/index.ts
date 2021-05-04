import { Events, Result } from "react-states";

export type StorageError = {
  type: "ERROR";
  data: string;
};

export type ExcalidrawElement = {
  id: string;
  version: number;
};

export type ExcalidrawMetadata = {
  id: string;
  author: string;
  last_updated: Date;
};

export type ExcalidrawData = {
  elements: ExcalidrawElement[];
  appState: { viewBackgroundColor: string };
  version: number;
};

export type ExcalidrawsByUser = {
  [userId: string]: {
    name: string;
    avatarUrl: string | null;
    excalidraws: ExcalidrawMetadata[];
  };
};

export type StorageEvent =
  | {
      type: "STORAGE:FETCH_EXCALIDRAW_SUCCESS";
      metadata: ExcalidrawMetadata;
      data: ExcalidrawData;
      image: Blob;
    }
  | {
      type: "STORAGE:FETCH_EXCALIDRAW_ERROR";
      error: string;
    }
  | {
      type: "STORAGE:EXCALIDRAW_DATA_UPDATE";
      id: string;
      data: ExcalidrawData;
    }
  | {
      type: "STORAGE:CREATE_EXCALIDRAW_SUCCESS";
      id: string;
    }
  | {
      type: "STORAGE:CREATE_EXCALIDRAW_ERROR";
      error: string;
    }
  | {
      type: "STORAGE:SAVE_EXCALIDRAW_SUCCESS";
      metadata: ExcalidrawMetadata;
      image: Blob;
    }
  | {
      type: "STORAGE:SAVE_EXCALIDRAW_ERROR";
      error: string;
    }
  | {
      type: "STORAGE:FETCH_PREVIEWS_SUCCESS";
      excalidrawsByUser: ExcalidrawsByUser;
    }
  | {
      type: "STORAGE:FETCH_PREVIEWS_ERROR";
      error: string;
    }
  | {
      type: "STORAGE:IMAGE_SRC_SUCCESS";
      id: string;
      src: string;
    }
  | {
      type: "STORAGE:IMAGE_SRC_ERROR";
      id: string;
      error: string;
    };

export interface Storage {
  events: Events<StorageEvent>;
  createExcalidraw(userId: string): void;
  fetchExcalidraw(userId: string, id: string): void;
  fetchPreviews(): void;
  saveExcalidraw(userId: string, id: string, data: ExcalidrawData): void;
  getImageSrc(userId: string, id: string): void;
}
