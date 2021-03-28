export interface OnVisibilityChange {
  (cb: (visible: boolean) => void): () => void;
}
