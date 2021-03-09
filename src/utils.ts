import { exportToCanvas } from "./excalidraw-src/scene/export";

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

export const createExcalidrawImage = (elements: any[], appState: any) => {
  const canvas = exportToCanvas(elements, appState, {
    exportBackground: true,
    shouldAddWatermark: false,
    viewBackgroundColor: "#FFF",
    exportPadding: 10,
    scale: 1,
  });

  return canvasToBlob(canvas);
};

export const blobToBase64 = (blob: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      resolve(String(reader.result));
    };
    reader.onerror = () => {
      reject(new Error("Unable to convert to Base64"));
    };
  });
};
