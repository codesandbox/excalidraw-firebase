import React from "react";
import { ExcalidrawPreview } from "./ExcalidrawPreview";
import { useDashboard } from "../features/Dashboard";
import { styled } from "../stitches.config";
import { match, PickState } from "react-states";
import { DashboardContext } from "../features/Dashboard";
import { useAuthenticatedAuth } from "../features/Auth";

const List = styled("ul", {
  listStyleType: "none",
  display: "flex",
  flexWrap: "wrap",
});

const Avatar = styled("img", {
  borderRadius: 999999,
  width: 40,
  height: 40,
  border: "1px solid #333",
});

const EmptyAvatar = styled("div", {
  backgroundColor: "#333",
  borderRadius: 999999,
  width: 40,
  height: 40,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "#EAEAEA",
  fontWeight: "bold",
});

const UserWrapper = styled("div", {
  display: "flex",
  alignItems: "center",
  padding: "0 2rem",
});

const UserName = styled("h2", {
  color: "#333",
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
  const [auth] = useAuthenticatedAuth();
  const [dashboard, dispatch] = useDashboard();

  const createExcalidraw = (
    <CreateNewExcalidraw
      onClick={() => {
        dispatch({ type: "CREATE_EXCALIDRAW" });
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
        {context.excalidraws[auth.user.uid].excalidraws.map((excalidraw) => (
          <ExcalidrawPreview
            key={excalidraw.id}
            userId={auth.user.uid}
            metadata={excalidraw}
          />
        ))}
      </List>
      {Object.keys(context.excalidraws)
        .filter((uid) => uid !== auth.user.uid)
        .map((uid) => {
          const user = context.excalidraws[uid];

          return (
            <div key={uid}>
              <UserWrapper>
                {user.avatarUrl ? (
                  <Avatar src={user.avatarUrl} />
                ) : (
                  <EmptyAvatar>?</EmptyAvatar>
                )}
                <UserName>{user.name}</UserName>
              </UserWrapper>
              <List key={uid}>
                {user.excalidraws.map((excalidraw) => (
                  <ExcalidrawPreview
                    key={excalidraw.id}
                    userId={uid}
                    metadata={excalidraw}
                  />
                ))}
              </List>
            </div>
          );
        })}
    </div>
  );

  return match(dashboard, {
    CREATING_EXCALIDRAW: () => (
      <div className="center-wrapper">
        <div className="lds-dual-ring"></div>
      </div>
    ),
    PREVIEWS_ERROR: ({ error }) => (
      <div className="center-wrapper">
        <p style={{ color: "tomato" }}>There was an error: {error}</p>
      </div>
    ),
    CREATE_EXCALIDRAW_ERROR: (context) => (
      <div className="center-wrapper">
        <p style={{ color: "tomato" }}>There was an error: {context.error}</p>
        {renderPreviews(context)}
      </div>
    ),
    EXCALIDRAW_CREATED: () => (
      <div className="center-wrapper">
        <div className="lds-dual-ring"></div>
      </div>
    ),
    LOADING_PREVIEWS: () => (
      <div className="center-wrapper">
        <div className="lds-dual-ring"></div>
      </div>
    ),
    PREVIEWS_LOADED: renderPreviews,
  });
};
