import React, { createContext, useContext } from "react";
import { Auth } from "./auth";
import { CopyImageToClipboard } from "./copyImageToClipboard";
import { CreateExcalidrawImage } from "./createExcalidrawImage";
import { OnVisibilityChange } from "./onVisibilityChange";
import { Storage } from "./storage";

export interface Environment {
  createExcalidrawImage: CreateExcalidrawImage;
  storage: Storage;
  auth: Auth;
  onVisibilityChange: OnVisibilityChange;
  copyImageToClipboard: CopyImageToClipboard;
}

const environmentContext = createContext({} as Environment);

export const useEnvironment = () => useContext(environmentContext);

export const Environment = ({
  children,
  environment,
}: {
  children: React.ReactNode;
  environment: Partial<Environment>;
}) => (
  <environmentContext.Provider value={environment as Environment}>
    {children}
  </environmentContext.Provider>
);
