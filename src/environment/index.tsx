import React, { createContext, useContext } from "react";
import { Authentication } from "./authentication";
import { CopyImageToClipboard } from "./copyImageToClipboard";
import { Visibility } from "./visibility";
import { Storage } from "./storage";

export interface Environment {
  storage: Storage;
  authentication: Authentication;
  visibility: Visibility;
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
