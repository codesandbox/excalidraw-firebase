import React from "react";
import { ExcalidrawPreview } from "./ExcalidrawPreview";
import { useDashboard } from "../features/Dashboard";
import { styled } from "../stitches.config";
import { useAuthenticatedAuth } from "../features/Auth";
import { PickState } from "react-states";
import { DashboardContext } from "../features/Dashboard";

const List = styled("ul", {
  listStyleType: "none",
  display: "flex",
  flexWrap: "wrap",
});

const UserName = styled("h2", {
  borderTop: "1px solid #EAEAEA",
  borderBottom: "1px solid #EAEAEA",
  backgroundColor: "#333",
  color: "#EAEAEA",
  padding: "1rem",
  textAlign: "left",
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
  const auth = useAuthenticatedAuth();
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

  const renderPreviews = (
    context: PickState<
      DashboardContext,
      "PREVIEWS_LOADED" | "CREATE_EXCALIDRAW_ERROR"
    >
  ) => (
    <div>
      <List>
        {createExcalidraw}
        {context.excalidraws[auth.context.user.uid].excalidraws
          .slice(0, context.showCount)
          .map((excalidraw) => (
            <ExcalidrawPreview
              key={excalidraw.id}
              userId={auth.context.user.uid}
              metadata={excalidraw}
            />
          ))}
      </List>
      {Object.keys(context.excalidraws)
        .filter((uid) => uid !== auth.context.user.uid)
        .map((uid) => (
          <div>
            <UserName>{context.excalidraws[uid].name}</UserName>
            <List key={uid}>
              {context.excalidraws[uid].excalidraws
                .slice(0, context.showCount)
                .map((excalidraw) => (
                  <ExcalidrawPreview
                    key={excalidraw.id}
                    userId={uid}
                    metadata={excalidraw}
                  />
                ))}
            </List>
          </div>
        ))}
    </div>
  );

  return dashboard.map({
    CREATING_EXCALIDRAW: () => <div className="lds-dual-ring"></div>,
    PREVIEWS_ERROR: ({ error }) => (
      <>
        <p style={{ color: "tomato" }}>There was an error: {error}</p>
      </>
    ),
    CREATE_EXCALIDRAW_ERROR: (context) => (
      <>
        <p style={{ color: "tomato" }}>There was an error: {context.error}</p>
        {renderPreviews(context)}
      </>
    ),
    EXCALIDRAW_CREATED: () => <div className="lds-dual-ring"></div>,
    LOADING_PREVIEWS: () => <div className="lds-dual-ring"></div>,
    PREVIEWS_LOADED: renderPreviews,
  });
};
