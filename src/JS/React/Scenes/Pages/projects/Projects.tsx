import React, { useState, useCallback, useEffect } from "react";
import { Typography, Button, Box, Divider } from "@mui/material";
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
  useUpdatePaymentMethodsForProject,
  useGetProjectDetails,
} from "JS/React/Hooks/Projects/Hook";
import { useCreateInvoice } from "JS/React/Hooks/Invoices/Hook";
import { useGetStripePaymentMethodsByClientId } from "JS/React/Hooks/PaymentMethods/Hook";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import numeral from "numeral";

// Import the partial components
import {
  NewProjectDialog,
  EditProjectDialog,
  DeleteProjectDialog,
  PaymentMethodsDialog,
  CreateInvoiceDialog,
  ProjectsTable,
} from "./partials";

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Helper function to convert dollars to cents
const dollarsToCents = (dollars: string | number): number => {
  const amount = typeof dollars === "string" ? parseFloat(dollars) : dollars;
  return Math.round(amount * 100);
};

export const ProjectsComponent = () => {
  const { selectedClient } = useSelectedClient();
  const { isSuperAdmin, isClient } = useAccessHandler();
  const navigate = useNavigate();
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();

  // State for dialog management
  const [openNewProjectDialog, setOpenNewProjectDialog] = useState(false);
  const [openEditProjectDialog, setOpenEditProjectDialog] = useState(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [openPaymentMethodsDialog, setOpenPaymentMethodsDialog] =
    useState(false);
  const [openCreateInvoiceDialog, setOpenCreateInvoiceDialog] = useState(false);

  // Project state
  const [newProjectName, setNewProjectName] = useState("");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [paymentMethodProjectId, setPaymentMethodProjectId] = useState<
    string | null
  >(null);
  const [paymentMethodProjectName, setPaymentMethodProjectName] =
    useState<string>("");
  const [invoiceProjectId, setInvoiceProjectId] = useState<string | null>(null);

  // Dialog state objects
  const [editProjectState, setEditProjectState] = useState({
    editingProject: null as Project | null,
    isLoading: false,
  });

  const [deleteProjectState, setDeleteProjectState] = useState({
    isLoading: false,
  });

  const [paymentMethodsState, setPaymentMethodsState] = useState({
    selectedPaymentMethodIds: [] as string[],
    isLoading: false,
    paymentMethodsLoading: false,
  });

  const [createInvoiceState, setCreateInvoiceState] = useState({
    invoiceAmount: "",
    invoiceDescription: "",
    invoiceDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    invoiceTime: new Date(),
    invoiceTimezone: dayjs.tz.guess(),
    amountError: "",
    isLoading: false,
  });

  // API hooks
  const { projectsData, projectsIsLoading } = useGetProjectsByClient(
    selectedClient?.id || null
  );

  const { projectData, projectIsLoading } = useGetProjectDetails(
    paymentMethodProjectId
  );

  const { stripePaymentMethods, stripePaymentMethodsIsLoading } =
    useGetStripePaymentMethodsByClientId(selectedClient?.id || null);

  const { createProject, createProjectIsLoading } = useCreateProject();
  const { updateProject, updateProjectIsLoading } = useUpdateProject();
  const { deleteProject, deleteProjectIsLoading } = useDeleteProject();
  const { updatePaymentMethodsForProject, updatePaymentMethodsIsLoading } =
    useUpdatePaymentMethodsForProject();
  const { createInvoice, createInvoiceIsLoading } = useCreateInvoice();

  // Update loading states from API hooks
  useEffect(() => {
    setEditProjectState((prev) => ({
      ...prev,
      isLoading: updateProjectIsLoading,
    }));
    setDeleteProjectState((prev) => ({
      ...prev,
      isLoading: deleteProjectIsLoading,
    }));
    setPaymentMethodsState((prev) => ({
      ...prev,
      isLoading: updatePaymentMethodsIsLoading,
      paymentMethodsLoading: stripePaymentMethodsIsLoading || projectIsLoading,
    }));
    setCreateInvoiceState((prev) => ({
      ...prev,
      isLoading: createInvoiceIsLoading,
    }));
  }, [
    updateProjectIsLoading,
    deleteProjectIsLoading,
    updatePaymentMethodsIsLoading,
    stripePaymentMethodsIsLoading,
    projectIsLoading,
    createInvoiceIsLoading,
  ]);

  // Use project data for payment methods dialog
  useEffect(() => {
    if (projectData && openPaymentMethodsDialog) {
      setPaymentMethodProjectName(projectData.name);
      setPaymentMethodsState((prev) => ({
        ...prev,
        selectedPaymentMethodIds: projectData.paymentMethodIds || [],
      }));
    }
  }, [projectData, openPaymentMethodsDialog]);

  // Handle onChange for dialog states
  const handleEditProjectChange = (
    field: keyof typeof editProjectState,
    value: any
  ) => {
    setEditProjectState((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteProjectChange = (
    field: keyof typeof deleteProjectState,
    value: any
  ) => {
    setDeleteProjectState((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentMethodsChange = (
    field: keyof typeof paymentMethodsState,
    value: any
  ) => {
    setPaymentMethodsState((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateInvoiceChange = (
    field: keyof typeof createInvoiceState,
    value: any
  ) => {
    setCreateInvoiceState((prev) => ({ ...prev, [field]: value }));
  };

  // Reset payment method dialog state
  const resetPaymentMethodDialogState = useCallback(() => {
    setPaymentMethodsState((prev) => ({
      ...prev,
      selectedPaymentMethodIds: [],
    }));
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
        setEditProjectState((prev) => ({ ...prev, editingProject: project }));
        setOpenEditProjectDialog(true);
      }
    },
    [projectsData]
  );

  // Handle update project
  const handleUpdateProject = async () => {
    const { editingProject } = editProjectState;
    if (!editingProject || !editingProject.name.trim()) return;

    try {
      await updateProject({
        projectId: editingProject.id!,
        data: { name: editingProject.name },
      });

      setEditProjectState((prev) => ({ ...prev, editingProject: null }));
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
    setCreateInvoiceState({
      invoiceAmount: "",
      invoiceDescription: "",
      invoiceDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      invoiceTime: new Date(),
      invoiceTimezone: dayjs.tz.guess(),
      amountError: "",
      isLoading: false,
    });
    setOpenCreateInvoiceDialog(true);
  }, []);

  // Format currency for display
  const formatCurrency = (amount: string | number) => {
    if (!amount) return "$0.00";
    return "$" + numeral(amount).format("0,0.00");
  };

  // Handle create invoice
  const handleCreateInvoice = async () => {
    const {
      invoiceAmount,
      amountError,
      invoiceDate,
      invoiceTime,
      invoiceTimezone,
      invoiceDescription,
    } = createInvoiceState;

    if (
      !selectedClient ||
      !invoiceProjectId ||
      !invoiceDate ||
      !invoiceTime ||
      amountError ||
      !invoiceAmount
    ) {
      return;
    }

    try {
      const dateObj = dayjs(invoiceDate);
      const timeObj = dayjs(invoiceTime);
      const combinedDateTime = dayjs.tz(
        `${dateObj.format("YYYY-MM-DD")}T${timeObj.format("HH:mm:00")}`,
        invoiceTimezone
      );
      const chargeDate = combinedDateTime.unix();

      // Convert dollar amount to cents before sending to API
      const amountInCents = dollarsToCents(invoiceAmount);
      console.log(
        "98c-1ur-1984u14",
        "Amount in dollars:",
        invoiceAmount,
        "Amount in cents:",
        amountInCents
      );

      await createInvoice({
        clientId: selectedClient.id,
        projectId: invoiceProjectId,
        amount: amountInCents,
        chargeDate: chargeDate,
        description: invoiceDescription.trim() || undefined,
      });

      setOpenCreateInvoiceDialog(false);
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  // Handle open payment methods dialog
  const handleOpenPaymentMethodsDialog = useCallback((projectId: string) => {
    setPaymentMethodProjectId(projectId);
    setOpenPaymentMethodsDialog(true);
  }, []);

  // Handle update payment methods
  const handleUpdatePaymentMethods = async () => {
    if (!paymentMethodProjectId) return;

    try {
      await updatePaymentMethodsForProject({
        projectId: paymentMethodProjectId,
        paymentMethodIds: paymentMethodsState.selectedPaymentMethodIds,
      });

      resetPaymentMethodDialogState();
    } catch (error) {
      console.error("Error updating payment methods:", error);
    }
  };

  // Handle delete project
  const handleDeleteProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    setOpenDeleteConfirmation(true);
  }, []);

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

      {/* Projects Table */}
      <ProjectsTable
        projects={projectsData || []}
        isLoading={projectsIsLoading}
        isClient={isClient}
        isSuperAdmin={isSuperAdmin}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        onOpenPaymentMethodsDialog={handleOpenPaymentMethodsDialog}
        onCreateInvoice={handleOpenCreateInvoiceDialog}
        paymentMethods={stripePaymentMethods || []}
      />

      {/* Dialog Components */}
      <NewProjectDialog
        open={openNewProjectDialog}
        onClose={() => setOpenNewProjectDialog(false)}
        projectName={newProjectName}
        setProjectName={setNewProjectName}
        onCreateProject={handleCreateProject}
        isLoading={createProjectIsLoading}
      />

      <EditProjectDialog
        open={openEditProjectDialog}
        onClose={() => setOpenEditProjectDialog(false)}
        state={editProjectState}
        onChange={handleEditProjectChange}
        onUpdateProject={handleUpdateProject}
      />

      <DeleteProjectDialog
        open={openDeleteConfirmation}
        onClose={() => setOpenDeleteConfirmation(false)}
        state={deleteProjectState}
        onChange={handleDeleteProjectChange}
        onConfirmDelete={handleConfirmDelete}
      />

      <PaymentMethodsDialog
        open={openPaymentMethodsDialog}
        onClose={resetPaymentMethodDialogState}
        projectName={paymentMethodProjectName}
        state={paymentMethodsState}
        onChange={handlePaymentMethodsChange}
        paymentMethods={stripePaymentMethods || []}
        onUpdatePaymentMethods={handleUpdatePaymentMethods}
      />

      <CreateInvoiceDialog
        open={openCreateInvoiceDialog}
        onClose={() => setOpenCreateInvoiceDialog(false)}
        state={createInvoiceState}
        onChange={handleCreateInvoiceChange}
        onCreateInvoice={handleCreateInvoice}
      />
    </Box>
  );
};
