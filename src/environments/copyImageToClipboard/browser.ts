import { CopyImageToClipboard } from "../../environment-interface/copyImageToClipboard";

export const createCopyImageToClipboard = (): CopyImageToClipboard => (
  image
) => {
  // @ts-ignore
  navigator.clipboard.write([
    // @ts-ignore
    new window.ClipboardItem({ "image/png": image }),
  ]);
};
