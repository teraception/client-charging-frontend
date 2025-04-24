import React, { useState, useCallback, useEffect } from "react";
import { Typography, Button, Box, Divider } from "@mui/material";
import { useSelectedClient } from "JS/React/Context/SelectedClientContext";
import AddIcon from "@mui/icons-material/Add";
import { Project, StatusCode } from "JS/typingForNow/types";
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
  AddPaymentMethodModal,
} from "./partials";
import { InvoiceStatus } from "JS/typingForNow/Invoice";
import shortid from "shortid";
import { localStorageKeys } from "JS/types/constants";
import { enqueueSnackbar } from "notistack";

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
  const [openAddPaymentMethodModal, setOpenAddPaymentMethodModal] = useState({
    open: false,
    projectId: null,
  });

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
    invoiceDate: new Date(),
    invoiceTime: new Date(),
    invoiceTimezone: dayjs.tz.guess(),
    invoiceCurrency: "USD", // Default currency
    chargeDays: "1", // Default to 1 day
    chargeTime: new Date(), // Default to current time
    shortId: shortid.generate(), // Add shortId field
    amountError: "",
    isLoading: false,
  });

  // API hooks
  const { projectsData, projectsIsLoading, refetchProjects } =
    useGetProjectsByClient(selectedClient?.id || null);

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

  useEffect(() => {
    // assigning card to project
    // assuming that the first card is the  new one

    const paymentMethodForProject = localStorage.getItem(
      localStorageKeys.paymentMethodForProject
    );
    if (paymentMethodForProject && stripePaymentMethods?.length > 0) {
      updatePaymentMethodsForProject({
        projectId: paymentMethodForProject,
        paymentMethodIds: [stripePaymentMethods[0]?.id],
      });

      localStorage.removeItem(localStorageKeys.paymentMethodForProject);
    }
  }, [stripePaymentMethods]);

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
      invoiceDate: new Date(),
      invoiceTime: new Date(),
      invoiceTimezone: dayjs.tz.guess(),
      invoiceCurrency: "USD", // Default currency
      chargeDays: "1", // Default to 1 day
      chargeTime: new Date(), // Default to current time
      shortId: shortid.generate(), // Initialize shortId as empty
      amountError: "",
      isLoading: false,
    });
    setOpenCreateInvoiceDialog(true);

    // Clear any previously selected files
    setTimeout(() => {
      const fileInput = document.querySelector(
        "#invoice-file-input"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    }, 100);
  }, []);

  // Handle create invoice
  const handleCreateInvoice = async () => {
    const {
      invoiceAmount,
      amountError,
      invoiceDate,
      invoiceTime,
      invoiceTimezone,
      invoiceDescription,
      invoiceCurrency,
      chargeDays,
      chargeTime,
      shortId, // Extract shortId from state
    } = createInvoiceState;

    if (
      !selectedClient ||
      !invoiceProjectId ||
      !invoiceDate ||
      !invoiceTime ||
      amountError ||
      !invoiceAmount ||
      !invoiceCurrency ||
      !chargeDays ||
      !chargeTime ||
      !shortId // Add validation for shortId
    ) {
      return;
    }

    try {
      // Create schedule date/time epoch in seconds
      const dateObj = dayjs(invoiceDate);
      const timeObj = dayjs(invoiceTime);
      const combinedDateTime = dayjs.tz(
        `${dateObj.format("YYYY-MM-DD")}T${timeObj.format("HH:mm:00")}`,
        invoiceTimezone
      );
      const sendDateTime = combinedDateTime.unix(); // Already in seconds

      // Create charge date/time epoch in seconds
      const chargeDateObj = dayjs(invoiceDate).add(parseInt(chargeDays), "day");
      const chargeTimeObj = dayjs(chargeTime);
      const combinedChargeDateTime = dayjs.tz(
        `${chargeDateObj.format("YYYY-MM-DD")}T${chargeTimeObj.format(
          "HH:mm:00"
        )}`,
        invoiceTimezone
      );
      const chargeDayTime = combinedChargeDateTime.unix(); // Already in seconds

      // Convert dollar amount to cents before sending to API
      const amountInCents = dollarsToCents(invoiceAmount);

      // Get file input element to access any selected files
      const fileInput = document.querySelector(
        "#invoice-file-input"
      ) as HTMLInputElement;
      const files = fileInput?.files || undefined;

      const response = await createInvoice({
        data: {
          clientId: selectedClient.id,
          projectId: invoiceProjectId,
          amount: amountInCents,
          currency: invoiceCurrency,
          sendDateTime: sendDateTime,
          chargeDayTime: chargeDayTime,
          timezone: invoiceTimezone,
          description: invoiceDescription.trim() || undefined,
          status: InvoiceStatus.DRAFT,
          shortId: shortId, // Use shortId from state
          // Other fields required by CreateInvoiceDto are added here
        },
        files: files,
      });

      if (response.statusCode === StatusCode.SUCCESS) {
        enqueueSnackbar("Invoice created successfully", {
          variant: "success",
          autoHideDuration: 3000,
        });
      }
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
        onAddPaymentMethod={(pId) => {
          setOpenAddPaymentMethodModal({
            open: true,
            projectId: pId,
          });
        }}
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

      <AddPaymentMethodModal
        open={openAddPaymentMethodModal.open}
        onClose={() =>
          setOpenAddPaymentMethodModal({
            open: false,
            projectId: null,
          })
        }
        projectId={openAddPaymentMethodModal.projectId}
        clientId={selectedClient?.id || null}
        onSuccess={() => {
          setOpenAddPaymentMethodModal({
            open: false,
            projectId: null,
          });
        }}
      />
    </Box>
  );
};
