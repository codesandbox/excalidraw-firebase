import {
  ExcalidrawData,
  ExcalidrawMetadata,
} from "../../../environment-interface/storage";

export type ClipboardState =
  | {
      state: "COPIED";
    }
  | {
      state: "NOT_COPIED";
    };

export type BaseState = {
  data: ExcalidrawData;
  remoteData?: ExcalidrawData;
  metadata: ExcalidrawMetadata;
  image: Blob;
  clipboard: ClipboardState;
};

export type ExcalidrawState =
  | {
      state: "LOADING";
    }
  | {
      state: "ERROR";
      error: string;
    }
  | (BaseState &
      (
        | {
            state: "LOADED";
          }
        | {
            state: "EDIT";
          }
        | {
            state: "DIRTY";
          }
        | {
            state: "SYNCING";
          }
        | {
            state: "SYNCING_DIRTY";
          }
      ));

export type ExcalidrawAction =
  | {
      type: "INITIALIZE_CANVAS_SUCCESS";
    }
  | {
      type: "COPY_TO_CLIPBOARD";
    }
  | {
      type: "EXCALIDRAW_CHANGE";
      data: ExcalidrawData;
    }
  | {
      type: "SAVE_TITLE";
      title: string;
    };

export type PrivateAction = {
  type: "SYNC";
};
