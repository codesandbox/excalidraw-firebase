import * as React from 'react'
import { Authentication } from "./authentication";
import { CopyImageToClipboard } from "./copyImageToClipboard";
import { Storage } from "./storage";
import { Loom } from "./loom";
import { createContext, useContext } from "react";


export interface Environment {
  storage: Storage;
  authentication: Authentication;
  copyImageToClipboard: CopyImageToClipboard;
  loom: Loom;
}

const environmentContext = createContext({} as Environment)

export const useEnvironment = () => useContext(environmentContext)

export const EnvironmentProvider: React.FC<{ environment: Environment }> = ({ children,  environment}) => (
    <environmentContext.Provider value={environment}>{children}</environmentContext.Provider>
)

export const createEnvironment = (constr: () => Environment) => constr()