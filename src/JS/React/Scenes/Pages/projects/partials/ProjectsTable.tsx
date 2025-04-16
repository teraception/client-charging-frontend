import React, { useMemo } from "react";
import { Box, Typography, IconButton, Tooltip, Button } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ColumnDef,
} from "material-react-table";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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
        Cell: ({ row }) => (
          <span>{row.original.paymentMethodIds?.length || 0}</span>
        ),
        size: 150,
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
