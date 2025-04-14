import { Typography, Button, Box, Paper } from "@mui/material";
import { Fragment, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccessHandler } from "JS/React/Hooks/AccessHandler";
import { useSelectedClient } from "JS/React/Context/SelectedClientContext";
import { useLoggedInUser } from "JS/Routing/Context/LoggedInUseContextProvider";

export const Dashboard = () => {
  const { isSuperAdmin, isClient } = useAccessHandler();
  const { selectedClient } = useSelectedClient();
  const { loggedInUser } = useLoggedInUser();
  const navigate = useNavigate();

  // For client users, redirect to projects page
  useEffect(() => {
    if (isClient && selectedClient) {
      navigate("/projects");
    }
  }, [isClient, selectedClient, navigate]);

  if (isSuperAdmin && !selectedClient) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Admin Dashboard
        </Typography>
        <Typography paragraph>
          Please select a client from the dropdown in the sidebar or manage all
          clients.
        </Typography>
      </Box>
    );
  }

  if (!selectedClient) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">
          No client selected. Please select a client from the sidebar.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {selectedClient.name} Dashboard
        </Typography>

        <Typography variant="body1" paragraph>
          Welcome {loggedInUser?.user?.name || loggedInUser?.user?.email}
        </Typography>
      </Paper>
    </Box>
  );
};
