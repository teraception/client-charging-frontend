import React, { createContext, useContext } from "react";
import { UserService } from "JS/Services/Users/Service";
import { ClientService } from "JS/Services/Clients/Service";
import { PaymentMethodService } from "JS/Services/Payment-method/Service";

export interface ServiceContextType {
  userService: UserService;
  clientService: ClientService;
  paymentMethodService: PaymentMethodService;
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
  const paymentMethodService = new PaymentMethodService();

  return (
    <ServiceContext.Provider
      value={{ userService, clientService, paymentMethodService }}
    >
      {children}
    </ServiceContext.Provider>
  );
};
