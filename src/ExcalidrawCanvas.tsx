import React, { useEffect, useMemo, useRef, useState } from "react";
import ExcalidrawComponent from "@excalidraw/excalidraw";

export const ExcalidrawCanvas = React.memo(
  ({
    data,
    onChange,
    readOnly,
  }: {
    data: any;
    readOnly: boolean;
    onChange: (elements: any[], appState: any) => void;
  }) => {
    const excalidrawRef = useRef<any>(null);
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
      if (readOnly) {
        excalidrawRef.current?.updateScene(data);
      }
    }, [data, readOnly]);

    useEffect(() => {
      if (readOnly) {
        excalidrawRef.current?.setScrollToCenter(data.elements);
      }
    }, [readOnly]);

    return (
      <div className="excalidraw-wrapper" ref={excalidrawWrapperRef}>
        <ExcalidrawComponent
          ref={excalidrawRef}
          width={dimensions.width}
          height={dimensions.height}
          initialData={data}
          onChange={onChange}
          zenModeEnabled={readOnly}
          viewModeEnabled={readOnly}
        />
      </div>
    );
  }
);
