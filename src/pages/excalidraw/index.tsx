import React from "react";

import { Excalidraw } from "./Excalidraw";
import { ExcalidrawFeature } from "../../features/Excalidraw";
import { useParams } from "react-router-dom";

export const ExcalidrawPage = () => {
  const { id, userId } = useParams<{ id: string; userId: string }>();

  return (
    <ExcalidrawFeature key={id} id={id} userId={userId}>
      <Excalidraw />
    </ExcalidrawFeature>
  );
};
