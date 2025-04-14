import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { useSelectedClient } from "JS/React/Context/SelectedClientContext";
import AddIcon from "@mui/icons-material/Add";
import { Project } from "JS/typingForNow/types";
import { useNavigate } from "react-router";
import { useRouting } from "JS/React/Hooks/Routes";
import { useAccessHandler } from "JS/React/Hooks/AccessHandler";
import {
  useCreateProject,
  useDeleteProject,
  useGetProjectsByClient,
  useUpdateProject,
} from "JS/React/Hooks/Projects/Hook";
import { useCreateInvoice } from "JS/React/Hooks/Invoices/Hook";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

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

  // Create project mutation
  const { createProject, createProjectIsLoading } = useCreateProject();

  // Update project mutation
  const { updateProject, updateProjectIsLoading } = useUpdateProject();

  // Delete project mutation
  const { deleteProject, deleteProjectIsLoading } = useDeleteProject();

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
  const handleEditProject = () => {
    const project = projectsData.find((p) => p.id === activeProjectId);
    if (project) {
      setEditingProject(project);
      setOpenEditProjectDialog(true);
    }
    handleMenuClose();
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

  // Handle delete project
  const handleDeleteClick = () => {
    setOpenDeleteConfirmation(true);
    handleMenuClose();
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

  // Handle add payment method
  const handleAddPaymentMethod = (projectId: string) => {
    // Navigate to payment method page
    navigate(
      routeProvider.react.addPaymentMethod(selectedClient?.id!, projectId)
    );
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

      {projectsIsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : projectsData.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="textSecondary">
            {isSuperAdmin
              ? 'No projects found. Create a new project using the "New Project" button.'
              : "No projects available for this client. Please contact an administrator."}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {projectsData.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {project.name}
                    </Typography>
                    {isSuperAdmin && (
                      <IconButton
                        aria-label="more"
                        aria-controls="project-menu"
                        aria-haspopup="true"
                        onClick={(e) => handleMenuOpen(e, project.id!)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Payment Methods: {project.paymentMethodIds?.length || 0}
                  </Typography>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    {isClient && (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleAddPaymentMethod(project.id!)}
                        fullWidth
                      >
                        Add Payment Method
                      </Button>
                    )}

                    {isSuperAdmin && (
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={() =>
                          handleOpenCreateInvoiceDialog(project.id!)
                        }
                        fullWidth
                      >
                        Create Invoice
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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

      {/* Project Menu */}
      <Menu
        id="project-menu"
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditProject}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};
