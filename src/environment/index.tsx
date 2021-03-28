import React, { createContext, useContext } from "react";
import { Auth } from "./auth";
import { CreateExcalidrawImage } from "./createExcalidrawImage";
import { OnVisibilityChange } from "./onVisibilityChange";
import { Storage } from "./storage";

export interface Environment {
  createExcalidrawImage: CreateExcalidrawImage;
  storage: Storage;
  auth: Auth;
  onVisibilityChange: OnVisibilityChange;
}

const environmentContext = createContext({} as Environment);

export const useEnvironment = () => useContext(environmentContext);

export const EnvironmentProvider = ({
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
