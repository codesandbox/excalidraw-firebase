import React from "react";

import { Excalidraw } from "./Excalidraw";
import { ExcalidrawFeature } from "../../features/Excalidraw";
import { useParams } from "react-router-dom";
import { RecordingFeature } from "../../features/Recording";
import { useAuth } from "../../features/Auth";

export const ExcalidrawPage = () => {
  const { id, userId } = useParams<{ id: string; userId: string }>();
  const [auth] = useAuth("AUTHENTICATED");

  return (
    <ExcalidrawFeature key={id} id={id} userId={userId}>
      <RecordingFeature apiKey={auth.loomApiKey}>
        <Excalidraw />
      </RecordingFeature>
    </ExcalidrawFeature>
  );
};
