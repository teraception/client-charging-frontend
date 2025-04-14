import React, { useState, useMemo } from "react";
import {
  Typography,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useSelectedClient } from "JS/React/Context/SelectedClientContext";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Project } from "JS/typingForNow/types";
import { useNavigate } from "react-router";
import { useRouting } from "JS/React/Hooks/Routes";
import { useAccessHandler } from "JS/React/Hooks/AccessHandler";
import {
  useCreateProject,
  useDeleteProject,
  useGetProjectsByClient,
  useUpdateProject,
  useUpdatePaymentMethodsForProject,
} from "JS/React/Hooks/Projects/Hook";
import { useCreateInvoice } from "JS/React/Hooks/Invoices/Hook";
import { useGetStripePaymentMethodsByClientId } from "JS/React/Hooks/PaymentMethods/Hook";
import { SelectComponent } from "JS/React/Components/SelectComponent";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ColumnDef,
} from "material-react-table";

export const ProjectsComponent = () => {
  const { selectedClient } = useSelectedClient();
  const { isSuperAdmin, isClient } = useAccessHandler();
  const [openNewProjectDialog, setOpenNewProjectDialog] = useState(false);
  const [openEditProjectDialog, setOpenEditProjectDialog] = useState(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Payment methods dialog state
  const [openPaymentMethodsDialog, setOpenPaymentMethodsDialog] =
    useState(false);
  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] = useState<
    string[]
  >([]);
  const [paymentMethodProjectId, setPaymentMethodProjectId] = useState<
    string | null
  >(null);
  const [paymentMethodProjectName, setPaymentMethodProjectName] =
    useState<string>("");

  // Invoice creation state
  const [openCreateInvoiceDialog, setOpenCreateInvoiceDialog] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(new Date());
  const [invoiceProjectId, setInvoiceProjectId] = useState<string | null>(null);
  const [amountError, setAmountError] = useState("");

  const navigate = useNavigate();
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();

  // Get projects for the selected client
  const { projectsData, projectsIsLoading, refetchProjects } =
    useGetProjectsByClient(selectedClient?.id || null);

  // Get Stripe payment methods for the selected client
  const { stripePaymentMethods, stripePaymentMethodsIsLoading } =
    useGetStripePaymentMethodsByClientId(selectedClient?.id || null);

  // Create project mutation
  const { createProject, createProjectIsLoading } = useCreateProject();

  // Update project mutation
  const { updateProject, updateProjectIsLoading } = useUpdateProject();

  // Delete project mutation
  const { deleteProject, deleteProjectIsLoading } = useDeleteProject();

  // Update payment methods mutation
  const { updatePaymentMethodsForProject, updatePaymentMethodsIsLoading } =
    useUpdatePaymentMethodsForProject();

  // Create invoice mutation
  const { createInvoice, createInvoiceIsLoading } = useCreateInvoice();

  // Handle menu open
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    projectId: string
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveProjectId(projectId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveProjectId(null);
  };

  // Handle create project
  const handleCreateProject = async () => {
    if (!selectedClient || !newProjectName.trim()) return;

    try {
      await createProject({
        name: newProjectName.trim(),
        clientId: selectedClient.id,
        paymentMethodIds: [],
      });

      setNewProjectName("");
      setOpenNewProjectDialog(false);
      refetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // Handle edit project
  const handleEditProject = (projectId: string) => {
    const project = projectsData.find((p) => p.id === projectId);
    if (project) {
      setEditingProject(project);
      setOpenEditProjectDialog(true);
    }
  };

  // Handle update project
  const handleUpdateProject = async () => {
    if (!editingProject || !editingProject.name.trim()) return;

    try {
      await updateProject({
        projectId: editingProject.id!,
        data: { name: editingProject.name },
      });

      setEditingProject(null);
      setOpenEditProjectDialog(false);
      refetchProjects();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  // Handle confirm delete project
  const handleConfirmDelete = async () => {
    if (!activeProjectId || !selectedClient) return;

    try {
      await deleteProject({
        projectId: activeProjectId,
        clientId: selectedClient.id,
      });

      setOpenDeleteConfirmation(false);
      refetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // Handle open create invoice dialog
  const handleOpenCreateInvoiceDialog = (projectId: string) => {
    setInvoiceProjectId(projectId);
    setInvoiceAmount("");
    setInvoiceDate(new Date());
    setAmountError("");
    setOpenCreateInvoiceDialog(true);
  };

  // Handle amount change with validation
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInvoiceAmount(value);

    // Validate amount - must be a positive whole number
    if (value && !/^\d+$/.test(value)) {
      setAmountError("Please enter a valid whole number");
    } else if (value && parseInt(value) <= 0) {
      setAmountError("Amount must be greater than 0");
    } else {
      setAmountError("");
    }
  };

  // Handle create invoice
  const handleCreateInvoice = async () => {
    if (
      !selectedClient ||
      !invoiceProjectId ||
      !invoiceDate ||
      amountError ||
      !invoiceAmount
    ) {
      return;
    }

    try {
      // Convert date to unix timestamp (milliseconds)
      const chargeDate = dayjs(invoiceDate).unix();

      await createInvoice({
        clientId: selectedClient.id,
        projectId: invoiceProjectId,
        amount: parseInt(invoiceAmount),
        chargeDate: chargeDate,
      });

      setOpenCreateInvoiceDialog(false);
      // Could navigate to invoices page or show success message
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  // Handle open payment methods dialog
  const handleOpenPaymentMethodsDialog = (projectId: string) => {
    const project = projectsData.find((p) => p.id === projectId);
    setPaymentMethodProjectId(projectId);
    setPaymentMethodProjectName(project?.name || "");
    setSelectedPaymentMethodIds(project?.paymentMethodIds || []);
    setOpenPaymentMethodsDialog(true);
  };

  // Handle update payment methods
  const handleUpdatePaymentMethods = async () => {
    if (!paymentMethodProjectId) return;

    try {
      await updatePaymentMethodsForProject({
        projectId: paymentMethodProjectId,
        paymentMethodIds: selectedPaymentMethodIds,
      });

      setOpenPaymentMethodsDialog(false);
      refetchProjects();
    } catch (error) {
      console.error("Error updating payment methods:", error);
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
                  onClick={() =>
                    handleOpenPaymentMethodsDialog(row.original.id!)
                  }
                >
                  Update Payments
                </Button>
              </>
            )}
            {isSuperAdmin && (
              <>
                <IconButton
                  size="small"
                  onClick={() => handleEditProject(row.original.id!)}
                  color="primary"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setActiveProjectId(row.original.id!);
                    setOpenDeleteConfirmation(true);
                  }}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <Button
                  variant="outlined"
                  size="small"
                  color="success"
                  onClick={() =>
                    handleOpenCreateInvoiceDialog(row.original.id!)
                  }
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
    [isClient, isSuperAdmin]
  );

  // Initialize table
  const table = useMaterialReactTable({
    columns,
    data: projectsData || [],
    enableFullScreenToggle: false,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    initialState: { density: "compact" },
    muiPaginationProps: {
      rowsPerPageOptions: [10, 25, 50],
    },
    state: {
      isLoading: projectsIsLoading,
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

  if (!selectedClient) {
    return (
      <Typography variant="h5" sx={{ padding: 3 }}>
        Please select a client to view projects
      </Typography>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Projects</Typography>
        {isSuperAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewProjectDialog(true)}
          >
            New Project
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      <MaterialReactTable table={table} />

      {/* New Project Dialog */}
      <Dialog
        open={openNewProjectDialog}
        onClose={() => setOpenNewProjectDialog(false)}
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewProjectDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            color="primary"
            disabled={!newProjectName.trim() || createProjectIsLoading}
          >
            {createProjectIsLoading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog
        open={openEditProjectDialog}
        onClose={() => setOpenEditProjectDialog(false)}
      >
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editingProject?.name || ""}
            onChange={(e) =>
              setEditingProject((prev) =>
                prev ? { ...prev, name: e.target.value } : null
              )
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditProjectDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateProject}
            variant="contained"
            color="primary"
            disabled={!editingProject?.name?.trim() || updateProjectIsLoading}
          >
            {updateProjectIsLoading ? <CircularProgress size={24} /> : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirmation}
        onClose={() => setOpenDeleteConfirmation(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirmation(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteProjectIsLoading}
          >
            {deleteProjectIsLoading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Invoice Dialog */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog
          open={openCreateInvoiceDialog}
          onClose={() => setOpenCreateInvoiceDialog(false)}
        >
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Amount"
              type="number"
              fullWidth
              variant="outlined"
              value={invoiceAmount}
              onChange={handleAmountChange}
              error={!!amountError}
              helperText={amountError}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                inputProps: { min: 1, step: 1 },
              }}
            />
            <Box sx={{ mt: 2 }}>
              <DatePicker
                label="Charge Date"
                value={invoiceDate}
                onChange={(newDate) => setInvoiceDate(newDate)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateInvoiceDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateInvoice}
              variant="contained"
              color="primary"
              disabled={
                !invoiceAmount ||
                !!amountError ||
                !invoiceDate ||
                createInvoiceIsLoading
              }
            >
              {createInvoiceIsLoading ? (
                <CircularProgress size={24} />
              ) : (
                "Create"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      {/* Payment Methods Selection Dialog */}
      <Dialog
        open={openPaymentMethodsDialog}
        onClose={() => setOpenPaymentMethodsDialog(false)}
        PaperProps={{
          sx: {
            maxHeight: "500px",
            overflow: "visible",
            maxWidth: "500px",
            width: "100%",
            position: "relative",
            zIndex: 1200,
          },
        }}
      >
        <DialogTitle>
          Update Payment Methods for {paymentMethodProjectName}
        </DialogTitle>
        <DialogContent sx={{ overflow: "visible", position: "relative" }}>
          {stripePaymentMethodsIsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : stripePaymentMethods.length === 0 ? (
            <Typography variant="body1" color="textSecondary" sx={{ py: 2 }}>
              No payment methods available. Please add payment methods first.
            </Typography>
          ) : (
            <Box sx={{ position: "relative", zIndex: 1300 }}>
              <SelectComponent
                title="Payment Methods"
                placeholder="Select payment methods"
                options={stripePaymentMethods.map((method) => ({
                  value: method.id,
                  label: `${method.card?.brand?.toUpperCase() || "CARD"} **** ${
                    method.card?.last4 || "****"
                  }`,
                }))}
                selectedValues={selectedPaymentMethodIds}
                onChange={setSelectedPaymentMethodIds}
                isMulti={true}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentMethodsDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePaymentMethods}
            variant="contained"
            color="primary"
            disabled={
              updatePaymentMethodsIsLoading || stripePaymentMethods.length === 0
            }
          >
            {updatePaymentMethodsIsLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Save"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
