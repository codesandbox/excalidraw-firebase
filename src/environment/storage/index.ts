import { Result } from "react-states";

export type StorageError = {
  type: "ERROR";
  data: string;
};

export type ExcalidrawMetadata = {
  id: string;
  author: string;
  last_updated: Date;
};

export type ExcalidrawData = {
  elements: any[];
  appState: any;
  version: number;
};

export type ExcalidrawsByUser = {
  [userId: string]: {
    name: string;
    excalidraws: ExcalidrawMetadata[];
  };
};

export interface Storage {
  createExcalidraw(userId: string): Result<string, StorageError>;
  getExcalidraw(
    userId: string,
    id: string
  ): Result<
    {
      metadata: ExcalidrawMetadata;
      data: ExcalidrawData;
    },
    StorageError
  >;
  getPreviews(): Result<ExcalidrawsByUser, StorageError>;
  hasExcalidrawUpdated(
    userId: string,
    id: string,
    date: Date
  ): Result<boolean, StorageError>;
  saveExcalidraw(
    userId: string,
    id: string,
    elements: any[],
    appState: any
  ): Result<ExcalidrawMetadata, StorageError>;
  saveImage(
    userId: string,
    id: string,
    image: Blob
  ): Result<void, StorageError>;
  getImageSrc(userId: string, id: string): Result<string, StorageError>;
}
