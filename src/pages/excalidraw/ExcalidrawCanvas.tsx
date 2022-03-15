import React, { useEffect, useRef, useState } from "react";
import { getSceneVersion } from "@excalidraw/excalidraw";
import { ExcalidrawData, ExcalidrawElement } from "../../features/Excalidraw";
import { getChangedData } from "../../utils";

export type ResolvablePromise<T> = Promise<T> & {
  resolve: [T] extends [undefined] ? (value?: T) => void : (value: T) => void;
  reject: (error: Error) => void;
};

function resolvablePromise<T>() {
  let resolve!: any;
  let reject!: any;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  (promise as any).resolve = resolve;
  (promise as any).reject = reject;
  return promise as ResolvablePromise<T>;
}

export const ExcalidrawCanvas = React.memo(
  ({
    data,
    remoteData,
    onChange,
    onInitialized,
    readOnly,
    isSyncing,
  }: {
    data: ExcalidrawData;
    remoteData?: ExcalidrawData;
    onChange: (elements: readonly ExcalidrawElement[], appState: any) => void;
    onInitialized: () => void;
    readOnly: boolean;
    isSyncing: boolean;
  }) => {
    const excalidrawRef = useRef<any>({
      readyPromise: resolvablePromise(),
    });
    const [Comp, setComp] = useState<React.FC<any> | null>(null);

    useEffect(() => {
      import("@excalidraw/excalidraw").then((comp) => {
        // @ts-ignore
        setComp(comp.default);
      });
    }, [Comp]);

    const excalidrawWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      excalidrawRef.current.readyPromise.then(onInitialized);
    }, []);

    useEffect(() => {
      if (!remoteData || isSyncing) {
        return;
      }

      excalidrawRef.current.readyPromise.then(
        ({ getSceneElementsIncludingDeleted, getAppState }: any) => {
          console.log("UPDATING DATA");
          const currentElements = getSceneElementsIncludingDeleted();
          const changedData = getChangedData(remoteData, {
            appState: getAppState(),
            elements: currentElements,
            version: getSceneVersion(currentElements),
          });

          if (changedData) {
            excalidrawRef.current.updateScene(changedData);
          }
        }
      );
    }, [isSyncing, remoteData]);

    return (
      <div className="h-screen m-0" ref={excalidrawWrapperRef}>
        {Comp ? (
          <Comp
            ref={excalidrawRef}
            initialData={data}
            onChange={onChange}
            viewModeEnabled={readOnly}
          />
        ) : null}
      </div>
    );
  }
);
