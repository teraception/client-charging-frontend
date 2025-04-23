import React, { useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ColumnDef,
} from "material-react-table";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AppleIcon from "@mui/icons-material/Apple";
import AndroidIcon from "@mui/icons-material/Android";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LinkIcon from "@mui/icons-material/Link";
import { Project } from "JS/typingForNow/types";
import { getPaymentMethodDisplay } from "JS/typingForNow/PaymentMethod";

interface ProjectsTableProps {
  projects: Project[];
  isLoading: boolean;
  isClient: boolean;
  isSuperAdmin: boolean;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenPaymentMethodsDialog: (projectId: string) => void;
  onCreateInvoice: (projectId: string) => void;
  onAddPaymentMethod: (projectId: string) => void;
  paymentMethods: any[];
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  isLoading,
  isClient,
  isSuperAdmin,
  onEditProject,
  onDeleteProject,
  onOpenPaymentMethodsDialog,
  onCreateInvoice,
  onAddPaymentMethod,
  paymentMethods,
}) => {
  // Helper function to get the appropriate icon based on the iconType
  const getIconForPaymentMethod = (iconType: string) => {
    switch (iconType) {
      case "card":
        return <CreditCardIcon fontSize="small" />;
      case "bank":
        return <AccountBalanceWalletIcon fontSize="small" />;
      case "wallet":
        return <AccountBalanceWalletIcon fontSize="small" />;
      case "apple":
        return <AppleIcon fontSize="small" />;
      case "google":
        return <AndroidIcon fontSize="small" />;
      case "link":
        return <LinkIcon fontSize="small" />;
      default:
        return <CreditCardIcon fontSize="small" />;
    }
  };

  // Define table columns
  const columns = useMemo<MRT_ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project Name",
        size: 180,
      },
      {
        accessorKey: "createdAt",
        header: "Created Date",
        Cell: ({ row }) => (
          <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
        ),
        size: 150,
      },
      {
        accessorKey: "paymentMethodIds",
        header: "Payment Methods",
        Cell: ({ row }) => {
          const projectPaymentMethodIds = row.original.paymentMethodIds || [];

          if (projectPaymentMethodIds.length === 0) {
            return (
              <Typography variant="body2" color="text.secondary">
                None
              </Typography>
            );
          }

          return (
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              sx={{ maxWidth: 280, gap: 1 }}
            >
              {projectPaymentMethodIds.map((pmId) => {
                const paymentMethod = paymentMethods.find(
                  (pm) => pm.id === pmId
                );

                if (!paymentMethod) {
                  return (
                    <Chip
                      key={pmId}
                      label="Unknown"
                      size="small"
                      color="default"
                      icon={<CreditCardIcon fontSize="small" />}
                      variant="filled"
                      sx={{
                        fontWeight: 500,
                        pl: 0.5,
                        borderRadius: "16px",
                        "& .MuiChip-label": {
                          padding: "0 8px 0 4px",
                        },
                      }}
                    />
                  );
                }

                const { label, color, iconType } =
                  getPaymentMethodDisplay(paymentMethod);
                const icon = getIconForPaymentMethod(iconType);

                return (
                  <Chip
                    key={pmId}
                    label={label}
                    size="small"
                    color={color}
                    icon={icon}
                    variant="filled"
                    sx={{
                      fontWeight: 500,
                      pl: 0.5,
                      borderRadius: "16px",
                      "& .MuiChip-label": {
                        padding: "0 8px 0 4px",
                      },
                    }}
                  />
                );
              })}
            </Stack>
          );
        },
        size: 280,
      },
      {
        id: "actions",
        header: "Actions",
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: "8px" }}>
            {isClient && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onOpenPaymentMethodsDialog(row.original.id!)}
                >
                  Update Payment Methods
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={() => onAddPaymentMethod(row.original.id!)}
                >
                  Add Payment Method
                </Button>
              </>
            )}
            {isSuperAdmin && (
              <>
                <Tooltip title="Edit project">
                  <IconButton
                    size="small"
                    onClick={() => onEditProject(row.original.id!)}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete project">
                  <IconButton
                    size="small"
                    onClick={() => onDeleteProject(row.original.id!)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={row.original.paymentMethodIds?.length === 0}
                  color="success"
                  onClick={() => onCreateInvoice(row.original.id!)}
                >
                  Create Invoice
                </Button>
              </>
            )}
          </Box>
        ),
        size: 350,
      },
    ],
    [
      isClient,
      isSuperAdmin,
      onEditProject,
      onDeleteProject,
      onOpenPaymentMethodsDialog,
      onCreateInvoice,
      onAddPaymentMethod,
      paymentMethods,
    ]
  );

  // Initialize table
  const table = useMaterialReactTable({
    columns,
    data: projects || [],
    enableFullScreenToggle: false,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    initialState: { density: "compact" },
    muiPaginationProps: {
      rowsPerPageOptions: [10, 25, 50],
    },
    state: {
      isLoading,
    },
    renderEmptyRowsFallback: () => (
      <Box sx={{ textAlign: "center", p: 2 }}>
        <Typography variant="body1" color="textSecondary">
          {isSuperAdmin
            ? 'No projects found. Create a new project using the "New Project" button.'
            : "No projects available for this client. Please contact an administrator."}
        </Typography>
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};
