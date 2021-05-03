import {
  ExcalidrawData,
  ExcalidrawElement,
  ExcalidrawMetadata,
  StorageEvent,
} from "../../environment/storage";

export type { ExcalidrawElement, ExcalidrawData, ExcalidrawMetadata };

export type ClipboardContext =
  | {
      state: "COPIED";
    }
  | {
      state: "NOT_COPIED";
    };

export type BaseContext = {
  data: ExcalidrawData;
  metadata: ExcalidrawMetadata;
  image: Blob;
  clipboard: ClipboardContext;
};

export type ExcalidrawContext =
  | {
      state: "LOADING";
    }
  | {
      state: "ERROR";
      error: string;
    }
  | (BaseContext &
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
        | {
            state: "UNFOCUSED";
          }
        | {
            state: "FOCUSED";
          }
        | {
            state: "UPDATING";
          }
        | {
            state: "UPDATING_FROM_PEER";
          }
      ));

export type PublicExcalidrawEvent =
  | {
      type: "INITIALIZE_CANVAS_SUCCESS";
    }
  | {
      type: "COPY_TO_CLIPBOARD";
    }
  | {
      type: "EXCALIDRAW_CHANGE";
      data: ExcalidrawData;
    };

export type PrivateExcalidrawEvent =
  | {
      type: "SYNC";
    }
  | {
      type: "FOCUS";
    }
  | {
      type: "BLUR";
    }
  /**
   *  When user focuses tab with a dirty change, go grab latest
   * from storage
   */
  | {
      type: "REFRESH";
    }
  /**
   * When user focuses tab with a dirty change, continue
   * with client version
   */
  | {
      type: "CONTINUE";
    }
  | {
      type: "SUBSCRIPTION_UPDATE";
      data: ExcalidrawData;
    };

export type ExcalidrawEvent =
  | PublicExcalidrawEvent
  | PrivateExcalidrawEvent
  | StorageEvent;
