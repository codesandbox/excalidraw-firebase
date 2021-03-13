import React, { createContext, useContext } from "react";
import { Externals } from "./interfaces";

const externalsContext = createContext({} as Externals);

export const useExternals = () => useContext(externalsContext);

export const ExternalsProvider = ({
  children,
  externals,
}: {
  children: React.ReactNode;
  externals: Partial<Externals>;
}) => (
  <externalsContext.Provider value={externals as Externals}>
    {children}
  </externalsContext.Provider>
);
