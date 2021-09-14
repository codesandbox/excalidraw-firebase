import React from "react";
import { ExcalidrawPreview as ExcalidrawPreviewComponent } from "./ExcalidrawPreview";
import { ExcalidrawPreview } from "../../environment/storage";

export const Dashboard = ({
  excalidraws,
}: {
  excalidraws: ExcalidrawPreview[];
}) => {
  return (
    <div style={{ paddingBottom: "5rem" }}>
      <ul className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4 pt-3 mt-6">
        {excalidraws.map((excalidraw) => (
          <ExcalidrawPreviewComponent
            key={excalidraw.metadata.id}
            user={excalidraw.user}
            metadata={excalidraw.metadata}
          />
        ))}
      </ul>
    </div>
  );
};
