import React, { createContext, useContext } from "react";
import { UserService } from "JS/Services/Users/Service";
import { ClientService } from "JS/Services/Clients/Service";

export interface ServiceContextType {
  userService: UserService;
  clientService: ClientService;
}

const ServiceContext = createContext<ServiceContextType>(null);

export const useAppServiceContext = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error(
      "useAppServiceContext must be used within a ServiceContextProvider"
    );
  }
  return context;
};

export const ServiceContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const userService = new UserService();
  const clientService = new ClientService();

  return (
    <ServiceContext.Provider value={{ userService, clientService }}>
      {children}
    </ServiceContext.Provider>
  );
};
