export interface LoomVideo {
  id: string;
  title: string;
  height: number;
  width: number;
  sharedUrl: string;
  embedUrl: string;
  thumbnailHeight?: number;
  thumbnailWidth?: number;
  thumbnailUrl?: string;
  duration?: number;
  providerUrl: string;
}

export type LoomEvent =
  | {
      type: "LOOM:CONFIGURED";
    }
  | {
      type: "LOOM:INSERT";
      video: LoomVideo;
    }
  | {
      type: "LOOM:START";
    }
  | {
      type: "LOOM:CANCEL";
    }
  | {
      type: "LOOM:COMPLETE";
    }
  | {
      type: "LOOM:ERROR";
      error: string;
    };

export interface Loom {
  configure(apiKey: string, buttonId: string): void;
  openVideo(video: LoomVideo): void;
}
