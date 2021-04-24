import React from "react";
import { ExcalidrawPreview } from "./ExcalidrawPreview";
import { useDashboard } from "../../features/Dashboard";
import { styled } from "../../stitches.config";
import { match, PickContext } from "react-states";
import { DashboardContext } from "../../features/Dashboard";
import { useAuth } from "../../features/Auth";

const List = styled("ul", {
  listStyleType: "none",
  display: "flex",
  flexWrap: "wrap",
  padding: "0 2rem",
  margin: "0",
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
  margin: "5rem 0 0 0",
});

const UserName = styled("h2", {
  color: "#333",
  padding: "1rem",
  textAlign: "left",
  margin: "0",
  letterSpacing: "-0.02rem",
  textTransform: "capitalize",
});

const CreateNewExcalidraw = styled("li", {
  fontSize: "24px",
  fontWeight: "bold",
  border: "1px dashed #dad7d7",
  padding: "2rem",
  letterSpacing: "-0.01rem",
  margin: "1rem 0 0 0",
  cursor: "pointer",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "200px",
  "&:hover": {
    backgroundColor: "#fafafa",
  },
});

export const Dashboard = () => {
  const [auth] = useAuth("AUTHENTICATED");
  const [dashboard, send] = useDashboard();

  const createExcalidraw = (
    <CreateNewExcalidraw
      onClick={() => {
        send({ type: "CREATE_EXCALIDRAW" });
      }}
    >
      Create new Excalidraw
    </CreateNewExcalidraw>
  );

  const renderPreviews = (
    context: PickContext<
      DashboardContext,
      "PREVIEWS_LOADED" | "CREATE_EXCALIDRAW_ERROR"
    >
  ) => (
    <div style={{ paddingBottom: "5rem" }}>
      <List>
        {createExcalidraw}
        {context.excalidraws[auth.user.uid].excalidraws
          .slice(0, context.showCount)
          .map((excalidraw) => (
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
                {user.excalidraws
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
