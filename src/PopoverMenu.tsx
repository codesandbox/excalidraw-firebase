import * as React from "react";
import { styled } from "./stitches.config";
import * as Popover from "@radix-ui/react-popover";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faTimes } from "@fortawesome/free-solid-svg-icons";

const Trigger = styled(Popover.Trigger, {
  position: "fixed",
  top: "10px",
  right: "100px",
  width: "35px",
  padding: "0.5rem",
});

const Menu = styled("ul", {
  backgroundColor: "#FFF",
  listStyleType: "none",
  margin: 0,
  padding: "1rem 0",
  border: "1px solid #333",
});

const MenuItem = styled("li", {
  padding: "0.5rem 1rem",
});

const Close = styled(Popover.Close, {
  position: "absolute",
  top: 3,
  right: 3,
  backgroundColor: "transparent",
  border: 0,
  outline: "none",
  cursor: "pointer",
});

export const PopoverMenu = ({ onDelete }: { onDelete: () => void }) => (
  <Popover.Root>
    <Trigger>
      <FontAwesomeIcon icon={faEllipsisV} />
    </Trigger>
    <Popover.Content>
      <Popover.Arrow />
      <Close>
        <FontAwesomeIcon icon={faTimes} />
      </Close>
      <Menu>
        <MenuItem>Delete</MenuItem>
      </Menu>
    </Popover.Content>
  </Popover.Root>
);
