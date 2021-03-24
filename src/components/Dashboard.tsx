import React from "react";
import { ExcalidrawPreview } from "./ExcalidrawPreview";
import { useDashboard } from "../features/Dashboard";
import { styled } from "../stitches.config";

const List = styled("ul", {
  listStyleType: "none",
  display: "flex",
  flexWrap: "wrap",
});

const CreateNewExcalidraw = styled("li", {
  fontSize: "24px",
  fontWeight: "bold",
  border: "1px dashed #eaeaea",
  padding: "2rem",
  margin: "1rem",
  cursor: "pointer",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "200px",
  height: "200px",
  "&:hover": {
    backgroundColor: "#fafafa",
  },
});

export const Dashboard = () => {
  const dashboard = useDashboard();

  const createExcalidraw = (
    <CreateNewExcalidraw
      onClick={() => {
        dashboard.dispatch({ type: "CREATE_EXCALIDRAW" });
      }}
    >
      Create new Excalidraw
    </CreateNewExcalidraw>
  );

  const previews =
    dashboard.context.state === "PREVIEWS_LOADED" ||
    dashboard.context.state === "CREATE_EXCALIDRAW_ERROR" ? (
      <List>
        {createExcalidraw}
        {dashboard.context.excalidraws
          .slice(0, dashboard.context.showCount)
          .map((excalidraw) => (
            <ExcalidrawPreview key={excalidraw.id} metadata={excalidraw} />
          ))}
      </List>
    ) : (
      <List>{createExcalidraw}</List>
    );

  return (
    <div className="center-wrapper">
      {dashboard.map({
        CREATING_EXCALIDRAW: () => <div className="lds-dual-ring"></div>,
        PREVIEWS_ERROR: ({ error }) => (
          <>
            <p style={{ color: "tomato" }}>There was an error: {error}</p>
          </>
        ),
        CREATE_EXCALIDRAW_ERROR: ({ error }) => (
          <>
            <p style={{ color: "tomato" }}>There was an error: {error}</p>
            {previews}
          </>
        ),
        EXCALIDRAW_CREATED: () => <div className="lds-dual-ring"></div>,
        LOADING_PREVIEWS: () => <div className="lds-dual-ring"></div>,
        PREVIEWS_LOADED: () => previews,
      })}
    </div>
  );
};
