import React from "react";

import { Excalidraw } from "./Excalidraw";

import { useParams } from "react-router-dom";

export const ExcalidrawPage = () => {
  const { id, userId } = useParams<{ id: string; userId: string }>();

  return <Excalidraw key={id} id={id} userId={userId} />;
};
