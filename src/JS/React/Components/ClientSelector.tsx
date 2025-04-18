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
  Autocomplete,
  TextField,
} from "@mui/material";
import { useAccessHandler } from "JS/React/Hooks/AccessHandler";
import { useLoggedInUser } from "JS/Routing/Context/LoggedInUseContextProvider";
import {
  useGetAllClients,
  useGetClientsWithUserId,
} from "JS/React/Hooks/Clients/Hook";
import { Client } from "JS/typingForNow/types";
import { useSelectedClient } from "JS/React/Context/SelectedClientContext";
import { useNavigate, useLocation } from "react-router-dom";
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
  const { routeBuilder, linkProvider } = useRouting();
  const routeProvider = routeBuilder();
  const location = window.location.pathname;

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
    // Extract clientId from URL if present
    const urlClientIdMatch = location.match(/\/clients\/([^\/]+)/);
    const urlClientId = urlClientIdMatch ? urlClientIdMatch[1] : null;

    if (isSuperAdmin && allClientsData) {
      setClients(allClientsData);
      setLoading(allClientsLoading);

      // For super_admin, check if URL has client ID
      if (urlClientId && allClientsData.length > 0) {
        const clientFromUrl = allClientsData.find((c) => c.id === urlClientId);
        if (clientFromUrl) {
          setSelectedClient(clientFromUrl);
        }
      }
      // Otherwise, we don't auto-select for super_admin (keep current behavior)
    } else if (isClient && userClientsData) {
      setClients(userClientsData);
      setLoading(userClientsLoading);

      // Only try to set selected client if we don't have one already
      if (!selectedClient && userClientsData.length > 0) {
        // First priority: Check URL for client ID
        if (urlClientId) {
          const clientFromUrl = userClientsData.find(
            (c) => c.id === urlClientId
          );
          if (clientFromUrl) {
            setSelectedClient(clientFromUrl);
            return;
          }
        }

        // Second priority: Check localStorage
        const savedClientId = localStorage.getItem("selectedClientId");
        if (savedClientId) {
          const savedClient = userClientsData.find(
            (c) => c.id === savedClientId
          );
          if (savedClient) {
            setSelectedClient(savedClient);
            return;
          }
        }

        // Last resort: Select first client
        setSelectedClient(userClientsData[0]);
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
    location,
    setSelectedClient,
  ]);

  // Handle redirection for client users
  useEffect(() => {
    // Only proceed if data is loaded and user is client type
    if (!isClient || userClientsLoading) return;

    // If we're on the dashboard, redirect client users to projects
    if (
      location === routeProvider.react.dashboard() &&
      userClientsData?.length > 0
    ) {
      // Keep showing loader during redirection
      setLoading(true);

      // Determine which client to use for redirection
      const urlClientIdMatch = location.match(/\/clients\/([^\/]+)/);
      const urlClientId = urlClientIdMatch ? urlClientIdMatch[1] : null;

      // Try to find client ID in this order: URL > selectedClient > localStorage > first client
      let targetClient: Client | null = null;

      // 1. Check URL
      if (urlClientId) {
        targetClient =
          userClientsData.find((c) => c.id === urlClientId) || null;
      }

      // 2. Check selectedClient
      if (!targetClient && selectedClient) {
        targetClient = selectedClient;
      }

      // 3. Check localStorage
      if (!targetClient) {
        const savedClientId = localStorage.getItem("selectedClientId");
        if (savedClientId) {
          targetClient =
            userClientsData.find((c) => c.id === savedClientId) || null;
        }
      }

      // 4. Use first client as fallback
      if (!targetClient && userClientsData.length > 0) {
        targetClient = userClientsData[0];
      }

      // Redirect with the determined client
      if (targetClient) {
        // Ensure the client is selected
        if (!selectedClient || selectedClient.id !== targetClient.id) {
          setSelectedClient(targetClient);
        }

        // Navigate to projects with this client
        navigate(linkProvider.react.projects(targetClient.id));
      }

      // Only stop loading after redirection is handled
      setLoading(false);
    }
  }, [
    isClient,
    userClientsData,
    userClientsLoading,
    location,
    selectedClient,
    navigate,
    routeProvider,
    linkProvider,
    setSelectedClient,
  ]);

  const handleClientChange = (client: Client | null) => {
    setSelectedClient(client);
    if (client) {
      navigate(linkProvider.react.projects(client.id));
    } else {
      navigate(linkProvider.react.dashboard());
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
      <Autocomplete
        options={clients}
        getOptionLabel={(option) => option.name}
        value={selectedClient}
        onChange={(_, newValue) => handleClientChange(newValue)}
        disableClearable={isClient}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Client"
            variant="outlined"
            sx={{
              "& .MuiInputBase-input": {
                color: "white",
              },
              // "& .MuiOutlinedInput-notchedOutline": {
              //   borderColor: "white",
              // },
              // "& .MuiInputLabel-root": {
              //   color: "white",
              // },
            }}
          />
        )}
      />
    </Box>
  );
};
