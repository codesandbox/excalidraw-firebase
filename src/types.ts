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

export type User = {
  uid: string;
  email: string | null;
};
