import React, { useEffect, useMemo, useRef, useState } from "react";
import ExcalidrawComponent from "@excalidraw/excalidraw";
import debounce from "lodash.debounce";

export const ExcalidrawCanvas = React.memo(
  ({ data, onChange }: { data: any; onChange: (elements: any[]) => void }) => {
    const excalidrawRef = useRef(null);
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

    const debouncedChange = useMemo(() => debounce(onChange, 1000), []);

    return (
      <div className="excalidraw-wrapper" ref={excalidrawWrapperRef}>
        <ExcalidrawComponent
          ref={excalidrawRef}
          width={dimensions.width}
          height={dimensions.height}
          initialData={data}
          onChange={debouncedChange}
        />
      </div>
    );
  }
);
