import React, { createContext, useContext, useState, ReactNode } from "react";
import { Client } from "JS/typingForNow/types";

interface SelectedClientContextType {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  clientId: string | null;
}

const SelectedClientContext = createContext<SelectedClientContextType>({
  selectedClient: null,
  setSelectedClient: () => null,
  clientId: null,
});

interface SelectedClientProviderProps {
  children: ReactNode;
}

export const SelectedClientProvider: React.FC<SelectedClientProviderProps> = ({
  children,
}) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <SelectedClientContext.Provider
      value={{
        selectedClient,
        setSelectedClient,
        clientId: selectedClient?.id || null,
      }}
    >
      {children}
    </SelectedClientContext.Provider>
  );
};

export const useSelectedClient = () => useContext(SelectedClientContext);
