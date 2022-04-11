import React from "react";

import { Excalidraw } from "./Excalidraw";
import { ExcalidrawFeature } from "../../features/Excalidraw";
import { useParams } from "react-router-dom";
import { RecordingFeature } from "../../features/Recording";
import { AuthFeature } from "../../features/Auth";
import { PickState } from "react-states";

export const ExcalidrawPage = ({
  auth,
}: {
  auth: PickState<AuthFeature, "AUTHENTICATED">;
}) => {
  const { id, userId } = useParams<{ id: string; userId: string }>();

  return (
    <ExcalidrawFeature key={id} id={id} userId={userId}>
      <RecordingFeature apiKey={auth.loomApiKey}>
        <Excalidraw />
      </RecordingFeature>
    </ExcalidrawFeature>
  );
};
