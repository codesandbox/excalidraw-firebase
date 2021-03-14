import React, { createContext, useContext } from "react";
import { Environment } from "./interfaces";

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
