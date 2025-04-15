import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Client } from "JS/typingForNow/types";
import { useRouting } from "../Hooks/Routes";

interface SelectedClientContextType {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  clientId: string | null;
  isClientSelected: boolean;
}

const SelectedClientContext = createContext<SelectedClientContextType>({
  selectedClient: null,
  setSelectedClient: () => null,
  clientId: null,
  isClientSelected: false,
});

interface SelectedClientProviderProps {
  children: ReactNode;
}

export const SelectedClientProvider: React.FC<SelectedClientProviderProps> = ({
  children,
}) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { linkProvider } = useRouting();

  // Parse client ID from URL on initial load
  useEffect(() => {
    const pathSegments = window.location.pathname.split("/");
    const clientIdIndex = pathSegments.indexOf("clients") + 1;
    if (clientIdIndex > 0 && pathSegments[clientIdIndex]) {
      // Fetch client details properly
      const fetchClient = async () => {
        try {
          const response = await fetch(
            `/api/client/${pathSegments[clientIdIndex]}`
          );
          const clientData = await response.json();
          setSelectedClient(clientData);
        } catch (error) {
          console.error("Error fetching client:", error);
        }
      };
      fetchClient();
    }
  }, []);

  return (
    <SelectedClientContext.Provider
      value={{
        selectedClient,
        setSelectedClient: (client) => {
          if (client?.id) {
            // Update URL when client changes
            window.history.replaceState(
              {},
              "",
              linkProvider.react.projects(client.id)
            );
          }
          setSelectedClient(client);
        },
        clientId: selectedClient?.id || null,
        isClientSelected: !!selectedClient,
      }}
    >
      {children}
    </SelectedClientContext.Provider>
  );
};

export const useSelectedClient = () => useContext(SelectedClientContext);
