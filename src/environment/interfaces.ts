import { ExcalidrawData, ExcalidrawMetadata, User } from "../types";

export interface Router {
  on<T extends { [key: string]: string }>(
    route: string,
    cb: (params: T) => void
  ): void;
  navigate(url: string): void;
  resolve(): void;
}

export interface CreateExcalidrawImage {
  (elements: any[], appState: any): Promise<Blob>;
}

export interface Auth {
  signIn(): Promise<User | null>;
  onAuthChange(cb: (user: User | null) => void): () => void;
}

export interface ExcalidrawStorage {
  createExcalidraw(userId: string): Promise<string>;
  getExcalidraw(
    userId: string,
    id: string
  ): Promise<{
    metadata: ExcalidrawMetadata;
    data: ExcalidrawData;
  }>;
  getPreviews(userId: string): Promise<ExcalidrawMetadata[]>;
  saveExcalidraw(
    userId: string,
    id: string,
    elements: any[],
    appState: any
  ): Promise<void>;
  saveImage(userId: string, id: string, image: Blob): Promise<void>;
}

export interface OnReOpen {
  (cb: () => void): () => void;
}

export interface Environment {
  createExcalidrawImage: CreateExcalidrawImage;
  router: Router;
  storage: ExcalidrawStorage;
  auth: Auth;
}
