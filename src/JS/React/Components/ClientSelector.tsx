import React, { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Box,
  Typography,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { useAccessHandler } from "JS/React/Hooks/AccessHandler";
import { useLoggedInUser } from "JS/Routing/Context/LoggedInUseContextProvider";
import {
  useGetAllClients,
  useGetClientsWithUserId,
} from "JS/React/Hooks/Clients/Hook";
import { Client } from "JS/typingForNow/types";
import { useSelectedClient } from "JS/React/Context/SelectedClientContext";
import { useNavigate } from "react-router-dom";
import { useRouting } from "JS/React/Hooks/Routes";

interface ClientSelectorProps {
  className?: string;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  className,
}) => {
  const { isSuperAdmin, isClient } = useAccessHandler();
  const { loggedInUser } = useLoggedInUser();
  const userId = loggedInUser?.user?.id || "";
  const { selectedClient, setSelectedClient } = useSelectedClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();

  // For super admin - get all clients
  const {
    clientsData: allClientsData,
    getAllClientsLoader: allClientsLoading,
  } = useGetAllClients();

  // For client user - get their clients
  const {
    clientsData: userClientsData,
    getClientsWithUserIdLoader: userClientsLoading,
  } = useGetClientsWithUserId(userId);

  // Persist selected client to localStorage when it changes
  useEffect(() => {
    if (selectedClient) {
      localStorage.setItem("selectedClientId", selectedClient.id);
    }
  }, [selectedClient]);

  // Initialize clients data and restore selected client from localStorage
  useEffect(() => {
    if (isSuperAdmin && allClientsData) {
      setClients(allClientsData);
      setLoading(allClientsLoading);

      // For super_admin, we don't auto-select the first client
      // This allows them to see the clients listing page by default
    } else if (isClient && userClientsData) {
      setClients(userClientsData);
      setLoading(userClientsLoading);

      // If we have no selected client, try to restore from localStorage
      if (!selectedClient && userClientsData.length > 0) {
        const savedClientId = localStorage.getItem("selectedClientId");

        if (savedClientId) {
          // Try to find the saved client in the available clients
          const savedClient = userClientsData.find(
            (c) => c.id === savedClientId
          );
          if (savedClient) {
            setSelectedClient(savedClient);
            // If we're on the dashboard, navigate to projects
            if (window.location.pathname === routeProvider.react.dashboard()) {
              navigate(routeProvider.react.projects());
            }
          } else {
            // If saved client not found, select the first one
            setSelectedClient(userClientsData[0]);
          }
        } else {
          // No saved client, select the first one
          setSelectedClient(userClientsData[0]);
        }
      }
    }
  }, [
    isSuperAdmin,
    isClient,
    allClientsData,
    userClientsData,
    allClientsLoading,
    userClientsLoading,
    selectedClient,
    navigate,
    routeProvider,
    setSelectedClient,
  ]);

  const handleClientChange = (event: SelectChangeEvent<string>) => {
    const selectedId = event.target.value;

    // Handle the "All Clients" option for super_admin
    if (selectedId === "all" && isSuperAdmin) {
      setSelectedClient(null);
      localStorage.removeItem("selectedClientId");
      return;
    }

    const client = clients.find((c) => c.id === selectedId) || null;
    setSelectedClient(client);

    // If client user selecting a client, navigate to projects
    if (
      isClient &&
      client &&
      window.location.pathname === routeProvider.react.dashboard()
    ) {
      navigate(routeProvider.react.projects());
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={24} sx={{ mr: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Loading clients...
        </Typography>
      </Box>
    );
  }

  if (clients.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {isSuperAdmin
            ? "No clients available. Create a client first."
            : "No clients assigned to you."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }} className={className}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "normal" }}>
        <span>Select Client</span>
      </Typography>
      <FormControl fullWidth size="small" variant="outlined">
        <InputLabel id="client-selector-label">Client</InputLabel>
        <Select
          labelId="client-selector-label"
          id="client-selector"
          value={selectedClient?.id || (isSuperAdmin ? "all" : "")}
          onChange={handleClientChange}
          label="Client"
        >
          {isSuperAdmin && (
            <MenuItem value="all">
              <em>All Clients</em>
            </MenuItem>
          )}
          {clients.map((client) => (
            <MenuItem key={client.id} value={client.id}>
              {client.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
