import { exportToCanvas } from "./excalidraw-src/scene/export";
import { CreateExcalidrawImage } from "../../interfaces";

export const canvasToBlob = async (
  canvas: HTMLCanvasElement
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          return reject(new Error("Unable to create blob"));
        }
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const createExcalidrawImage: CreateExcalidrawImage = (
  elements,
  appState
) => {
  const canvas = exportToCanvas(elements, appState, {
    exportBackground: true,
    shouldAddWatermark: false,
    viewBackgroundColor: "#FFF",
    exportPadding: 10,
    scale: 1,
  });

  return canvasToBlob(canvas);
};
