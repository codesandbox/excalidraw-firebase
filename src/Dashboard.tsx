import React, { useEffect } from "react";
import firebase from "firebase/app";
import { useStates } from "react-states";
import { EXCALIDRAWS_COLLECTION, USERS_COLLECTION } from "./constants";
import { useAuthenticatedAuth } from "./AuthProvider";
import { useNavigation } from "./NavigationProvider";
import { ExcalidrawPreview } from "./ExcalidrawPreview";
import { ExcalidrawMetaData } from "./types";
import { useDashboard } from "./DashboardProvider";
import { styled } from "./stitches.config";
/*

ul {

}

ul > li {
  border-radius: 3px;
  border: 1px solid #eaeaea;
  display: flex;
  margin: 1rem;
  padding: 1rem;
  align-items: center;
  justify-content: center;
  width: 200px;
  font-size: 11px;
  height: 200px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  box-sizing: border-box;
  cursor: pointer;
}

ul > li:hover {
  background-color: #fafafa;
}
*/

const List = styled("ul", {
  listStyleType: "none",
  display: "flex",
  li: {
    borderRadius: "3px",
    border: "1px solid #eaeaea",
    display: "flex",
    margin: "1rem",
    padding: "1rem",
    alignItems: "center",
    justifyContent: "center",
    width: "200px",
    fontSize: "11px",
    height: "200px",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    boxSizing: "border-box",
    cursor: "pointer",
  },
});

const CreateNewExcalidraw = styled("li", {
  fontSize: "18px",
  fontWeight: "bold",
  border: "1px dashed #eaeaea",
  padding: "2rem",
  boxSizing: "border-box",
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
      {dashboard.transform({
        CREATING_EXCALIDRAW: () => <h1>..creating Excalidraw...</h1>,
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
        EXCALIDRAW_CREATED: () => <h1>...redirecting...</h1>,
        LOADING_PREVIEWS: () => <h1>...loading previews...</h1>,
        PREVIEWS_LOADED: () => previews,
      })}
    </div>
  );
};
