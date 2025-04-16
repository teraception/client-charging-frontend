import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  Tooltip,
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
  useGetProjectDetails,
} from "JS/React/Hooks/Projects/Hook";
import { useCreateInvoice } from "JS/React/Hooks/Invoices/Hook";
import { useGetStripePaymentMethodsByClientId } from "JS/React/Hooks/PaymentMethods/Hook";
import { SelectComponent } from "JS/React/Components/SelectComponent";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import numeral from "numeral";
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
  const [invoiceDescription, setInvoiceDescription] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const [invoiceProjectId, setInvoiceProjectId] = useState<string | null>(null);
  const [amountError, setAmountError] = useState("");

  const navigate = useNavigate();
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();

  // Get projects for the selected client
  const { projectsData, projectsIsLoading } = useGetProjectsByClient(
    selectedClient?.id || null
  );

  // Get specific project details for the payment methods dialog
  const { projectData, projectIsLoading } = useGetProjectDetails(
    paymentMethodProjectId
  );

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

  // Use project data from detailed query for payment methods dialog
  useEffect(() => {
    if (projectData && openPaymentMethodsDialog) {
      setPaymentMethodProjectName(projectData.name);
      setSelectedPaymentMethodIds(projectData.paymentMethodIds || []);
    }
  }, [projectData, openPaymentMethodsDialog]);

  // Reset payment method dialog state
  const resetPaymentMethodDialogState = useCallback(() => {
    setSelectedPaymentMethodIds([]);
    setPaymentMethodProjectName("");
    setPaymentMethodProjectId(null);
    setOpenPaymentMethodsDialog(false);
  }, []);

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
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // Handle edit project
  const handleEditProject = useCallback(
    (projectId: string) => {
      const project = projectsData.find((p) => p.id === projectId);

      if (project) {
        setEditingProject(project);
        setOpenEditProjectDialog(true);
      }
    },
    [projectsData]
  );

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
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // Handle open create invoice dialog
  const handleOpenCreateInvoiceDialog = useCallback((projectId: string) => {
    setInvoiceProjectId(projectId);
    setInvoiceAmount("");
    setInvoiceDescription("");
    setInvoiceDate(new Date(new Date().setDate(new Date().getDate() + 1)));
    setAmountError("");
    setOpenCreateInvoiceDialog(true);
  }, []);

  // Handle amount change with validation
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Remove all non-numeric characters except the decimal point
    const rawValue = value.replace(/[^0-9.]/g, "");

    // Only allow one decimal point
    const parts = rawValue.split(".");
    const sanitizedValue = parts[0] + (parts.length > 1 ? "." + parts[1] : "");

    // Limit to 2 decimal places
    const decimalParts = sanitizedValue.split(".");
    let finalValue = decimalParts[0];
    if (decimalParts.length > 1) {
      finalValue += "." + decimalParts[1].substring(0, 2);
    }

    // Update the state with the raw value
    setInvoiceAmount(finalValue);

    // Validate the amount
    if (finalValue && parseFloat(finalValue) <= 0) {
      setAmountError("Amount must be greater than 0");
    } else {
      setAmountError("");
    }
  };

  // Format currency for display elsewhere in the UI
  const formatCurrency = (amount: string | number) => {
    if (!amount) return "$0.00";
    return "$" + numeral(amount).format("0,0.00");
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
        amount: parseFloat(invoiceAmount),
        chargeDate: chargeDate,
        description: invoiceDescription.trim() || undefined,
      });

      setOpenCreateInvoiceDialog(false);
      // Could navigate to invoices page or show success message
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  // Handle open payment methods dialog
  const handleOpenPaymentMethodsDialog = useCallback((projectId: string) => {
    // Set just the ID first, then let the useEffect handle getting the data
    setPaymentMethodProjectId(projectId);
    setOpenPaymentMethodsDialog(true);
  }, []);

  // Handle update payment methods
  const handleUpdatePaymentMethods = async () => {
    if (!paymentMethodProjectId) return;

    try {
      await updatePaymentMethodsForProject({
        projectId: paymentMethodProjectId,
        paymentMethodIds: selectedPaymentMethodIds,
      });

      resetPaymentMethodDialogState();
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
                  Update Payment Methods
                </Button>
              </>
            )}
            {isSuperAdmin && (
              <>
                <Tooltip title="Edit project">
                  <IconButton
                    size="small"
                    onClick={() => handleEditProject(row.original.id!)}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete project">
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
                </Tooltip>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={row.original.paymentMethodIds?.length === 0}
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
    [
      isClient,
      isSuperAdmin,
      handleEditProject,
      handleOpenCreateInvoiceDialog,
      handleOpenPaymentMethodsDialog,
    ]
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
              label="Amount In Cents"
              type="text"
              fullWidth
              variant="outlined"
              value={invoiceAmount}
              onChange={handleAmountChange}
              error={!!amountError}
              helperText={
                amountError || "Enter amount with up to 2 decimal places"
              }
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={invoiceDescription}
              onChange={(e) => setInvoiceDescription(e.target.value)}
              placeholder="Enter invoice description (optional)"
            />
            <Box sx={{ mt: 2 }}>
              <DatePicker
                label="Charge Date"
                value={invoiceDate}
                onChange={(newDate) => setInvoiceDate(newDate)}
                minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
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
        onClose={resetPaymentMethodDialogState}
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
          Update Payment Methods for {paymentMethodProjectName || "Project"}
        </DialogTitle>
        <DialogContent sx={{ overflow: "visible", position: "relative" }}>
          {stripePaymentMethodsIsLoading || projectIsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : stripePaymentMethods.length === 0 ? (
            <Typography variant="body1" color="textSecondary" sx={{ py: 2 }}>
              No payment methods available. Please add payment methods first.
            </Typography>
          ) : (
            <Box sx={{ position: "relative", zIndex: 1300 }}>
              {/* Display currently selected payment methods */}
              {selectedPaymentMethodIds.length > 0 && (
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: "#f0f7ff",
                    borderRadius: 1,
                    border: "1px solid #b3d1ff",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: "#0047b3" }}
                  >
                    Currently Selected Payment Method:
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {selectedPaymentMethodIds.map((id) => {
                      const method = stripePaymentMethods.find(
                        (m) => m.id === id
                      );
                      return method ? (
                        <Typography key={id} variant="body2">
                          {method.card?.brand?.toUpperCase() || "CARD"} ****{" "}
                          {method.card?.last4 || "****"}
                        </Typography>
                      ) : (
                        <Typography
                          key={id}
                          variant="body2"
                          color="text.secondary"
                        >
                          Unknown payment method ({id})
                        </Typography>
                      );
                    })}
                  </Box>
                </Box>
              )}

              <SelectComponent
                title="Payment Methods"
                placeholder="Select payment methods"
                options={(stripePaymentMethods || []).map((method) => ({
                  value: method.id,
                  label: `${method.card?.brand?.toUpperCase() || "CARD"} **** ${
                    method.card?.last4 || "****"
                  }`,
                }))}
                selectedValues={selectedPaymentMethodIds}
                onChange={(values) => {
                  console.log("New selected values:", values);
                  // If single value returned (not array), wrap in array
                  const newValues = Array.isArray(values)
                    ? values
                    : values?.value
                    ? [values.value]
                    : [];
                  setSelectedPaymentMethodIds(newValues);
                }}
                isMulti={false}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={resetPaymentMethodDialogState}>Cancel</Button>
          <Button
            onClick={handleUpdatePaymentMethods}
            variant="contained"
            color="primary"
            disabled={
              updatePaymentMethodsIsLoading ||
              stripePaymentMethods.length === 0 ||
              projectIsLoading
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
