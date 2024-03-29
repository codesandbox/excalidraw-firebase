import React, { useEffect, useRef, useState } from "react";
import { getSceneVersion } from "@excalidraw/excalidraw";

import { getChangedData } from "../../utils";
import {
  ExcalidrawData,
  ExcalidrawElement,
} from "../../environment-interface/storage";
import { useEnvironment } from "../../environment-interface";

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
    onChange,
    onInitialized,
    readOnly,
  }: {
    data: ExcalidrawData;
    onChange: (elements: readonly ExcalidrawElement[], appState: any) => void;
    onInitialized: () => void;
    readOnly: boolean;
  }) => {
    const { storage } = useEnvironment();
    const excalidrawRef = useRef<any>({
      readyPromise: resolvablePromise(),
    });
    const [Comp, setComp] = useState<React.FC<any> | null>(null);

    useEffect(() => {
      import("@excalidraw/excalidraw").then((comp) => {
        setComp(comp.Excalidraw);
      });
    }, [Comp]);

    const excalidrawWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      excalidrawRef.current.readyPromise.then(onInitialized);
    }, []);

    useEffect(
      () =>
        storage.subscribe((event) => {
          if (event.type === "STORAGE:EXCALIDRAW_DATA_UPDATE") {
            excalidrawRef.current.readyPromise.then(
              ({ getSceneElementsIncludingDeleted, getAppState }: any) => {
                const currentElements = getSceneElementsIncludingDeleted();
                const changedData = getChangedData(event.data, {
                  appState: getAppState(),
                  elements: currentElements,
                  version: getSceneVersion(currentElements),
                });

                if (changedData) {
                  excalidrawRef.current.updateScene(changedData);
                }
              },
            );
          }
        }),
      [],
    );

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
  },
);
