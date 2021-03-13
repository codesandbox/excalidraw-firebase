import React, { useEffect, useRef, useState } from "react";
import ExcalidrawComponent from "@excalidraw/excalidraw";

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
  }: {
    data: any;
    onChange: (elements: any[], appState: any) => void;
    onInitialized: () => void;
  }) => {
    const excalidrawRef = useRef<any>({
      readyPromise: resolvablePromise(),
    });
    const excalidrawWrapperRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState<{
      width: number | undefined;
      height: number | undefined;
    }>({
      width: undefined,
      height: undefined,
    });

    useEffect(() => {
      setDimensions({
        width: excalidrawWrapperRef.current?.getBoundingClientRect().width,
        height: excalidrawWrapperRef.current?.getBoundingClientRect().height,
      });
      const onResize = () => {
        setDimensions({
          width: excalidrawWrapperRef.current?.getBoundingClientRect().width,
          height: excalidrawWrapperRef.current?.getBoundingClientRect().height,
        });
      };

      window.addEventListener("resize", onResize);

      return () => window.removeEventListener("resize", onResize);
    }, [excalidrawWrapperRef]);

    useEffect(() => {
      excalidrawRef.current.readyPromise.then(onInitialized);
    }, []);

    return (
      <div className="excalidraw-wrapper" ref={excalidrawWrapperRef}>
        <ExcalidrawComponent
          ref={excalidrawRef}
          width={dimensions.width}
          height={dimensions.height}
          initialData={data}
          onChange={onChange}
        />
      </div>
    );
  }
);
