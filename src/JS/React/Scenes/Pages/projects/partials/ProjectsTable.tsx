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

interface ProjectsTableProps {
  projects: Project[];
  isLoading: boolean;
  isClient: boolean;
  isSuperAdmin: boolean;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenPaymentMethodsDialog: (projectId: string) => void;
  onCreateInvoice: (projectId: string) => void;
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
  paymentMethods,
}) => {
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

                // Determine payment method display based on type
                let paymentLabel = "Unknown";
                let chipColor = "default";
                let chipIcon = <CreditCardIcon fontSize="small" />;

                if (paymentMethod) {
                  if (
                    paymentMethod.type === "apple_pay" ||
                    paymentMethod.card?.wallet?.type === "apple_pay"
                  ) {
                    paymentLabel = "Apple Pay";
                    chipColor = "primary";
                    chipIcon = <AppleIcon fontSize="small" />;
                  } else if (
                    paymentMethod.type === "google_pay" ||
                    paymentMethod.card?.wallet?.type === "google_pay"
                  ) {
                    paymentLabel = "Google Pay";
                    chipColor = "secondary";
                    chipIcon = <AndroidIcon fontSize="small" />;
                  } else if (
                    paymentMethod.type === "link" ||
                    paymentMethod.card?.wallet?.type === "link"
                  ) {
                    paymentLabel = "Link";
                    chipColor = "info";
                    chipIcon = <LinkIcon fontSize="small" />;
                  } else if (paymentMethod.card?.wallet) {
                    paymentLabel = `${
                      paymentMethod.card.wallet.type || "Wallet"
                    }`;
                    chipColor = "success";
                    chipIcon = <AccountBalanceWalletIcon fontSize="small" />;
                  } else if (paymentMethod.card) {
                    // Handle regular cards with simplified display
                    paymentLabel = `${paymentMethod.card.brand || "Card"} *${
                      paymentMethod.card.last4 || ""
                    }`;
                    chipColor = "default";
                    chipIcon = <CreditCardIcon fontSize="small" />;
                  }
                }

                return (
                  <Chip
                    key={pmId}
                    label={paymentLabel}
                    size="small"
                    color={chipColor as any}
                    icon={chipIcon}
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
