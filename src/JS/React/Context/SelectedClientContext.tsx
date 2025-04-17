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
            // Only update URL if not already on a client-specific page
            const currentPath = window.location.pathname;
            const pathSegments = currentPath.split("/");
            const clientsIndex = pathSegments.indexOf("clients");

            // Don't update URL if already on a client-specific page
            if (
              clientsIndex === -1 ||
              (clientsIndex >= 0 && !pathSegments[clientsIndex + 1])
            ) {
              window.history.replaceState(
                {},
                "",
                linkProvider.react.projects(client.id)
              );
            } else if (
              clientsIndex >= 0 &&
              pathSegments[clientsIndex + 1] !== client.id
            ) {
              // If switching clients, preserve the current page type but update client ID
              const newPathSegments = [...pathSegments];
              newPathSegments[clientsIndex + 1] = client.id;
              window.history.replaceState({}, "", newPathSegments.join("/"));
            }
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
