import React, { createContext, useContext } from "react";
import Navigo from "navigo";

const navigationContext = createContext({} as Navigo);

export const useNavigation = () => useContext(navigationContext);

export const NavigationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <navigationContext.Provider value={new Navigo("/")}>
    {children}
  </navigationContext.Provider>
);
