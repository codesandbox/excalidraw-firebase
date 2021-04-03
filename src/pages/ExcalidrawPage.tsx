import React from "react";

import { Excalidraw } from "../components/Excalidraw";
import { ExcalidrawFeature } from "../features/Excalidraw";
import { useParams } from "react-router-dom";

export const ExcalidrawPage = () => {
  let { id, userId } = useParams<{ id: string; userId: string }>();

  return (
    <ExcalidrawFeature key={id} id={id} userId={userId}>
      <Excalidraw />
    </ExcalidrawFeature>
  );
};
