import { useState, useMemo } from "react";
import {
  Typography,
  Button,
  Box,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { useSelectedClient } from "JS/React/Context/SelectedClientContext";
import { useAccessHandler } from "JS/React/Hooks/AccessHandler";
import {
  useGetInvoicesByClient,
  useDeleteInvoice,
  usePayInvoiceNow,
  useSendInvoiceEmailToClient,
} from "JS/React/Hooks/Invoices/Hook";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import PaymentIcon from "@mui/icons-material/Payment";
import DownloadIcon from "@mui/icons-material/Download";
import BugReportIcon from "@mui/icons-material/BugReport";
import dayjs from "dayjs";
import numeral from "numeral";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ColumnDef,
} from "material-react-table";

const Invoices = () => {
  const { selectedClient } = useSelectedClient();
  const { isSuperAdmin, isClient } = useAccessHandler();
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [activeInvoiceData, setActiveInvoiceData] = useState<{
    invoiceId: string;
    dbInvoiceId: string;
  }>({
    invoiceId: "",
    dbInvoiceId: "",
  });
  const [processingPayment, setProcessingPayment] = useState<string | null>(
    null
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Get invoices for the selected client
  const { invoicesData, invoicesIsLoading, refetchInvoices } =
    useGetInvoicesByClient(selectedClient?.id || null);

  // Delete invoice mutation
  const { deleteInvoice, deleteInvoiceIsLoading } = useDeleteInvoice();

  // Pay invoice now mutation
  const { payInvoiceNow, payInvoiceNowIsLoading } = usePayInvoiceNow();

  // Send invoice email mutation
  const { sendInvoiceEmailToClient, sendInvoiceEmailToClientIsLoading } =
    useSendInvoiceEmailToClient();

  // Handle delete invoice
  const handleDeleteClick = (invoiceId: string, dbInvoiceId: string) => {
    setActiveInvoiceData({
      invoiceId,
      dbInvoiceId,
    });
    setOpenDeleteConfirmation(true);
  };

  // Handle pay now
  const handlePayNow = async (invoiceId: string) => {
    try {
      setProcessingPayment(invoiceId);
      await payInvoiceNow(invoiceId);
      refetchInvoices();
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setProcessingPayment(null);
    }
  };

  // Handle confirm delete invoice
  const handleConfirmDelete = async () => {
    if (!activeInvoiceData.invoiceId || !activeInvoiceData.dbInvoiceId) return;

    try {
      await deleteInvoice({
        invoiceId: activeInvoiceData.invoiceId,
        dbInvoiceId: activeInvoiceData.dbInvoiceId,
      });

      setOpenDeleteConfirmation(false);
      refetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  // Format date from timestamp
  const formatTimestampsDate = (timestamp: number) => {
    return dayjs(timestamp * 1000).format("DD/MM/YYYY");
  };

  // Format amount to display with currency and commas using numeral
  const formatAmount = (amount: number) => {
    return numeral(amount).format("$0,0.00");
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle send invoice email
  const handleSendInvoiceEmail = async (
    invoiceData: any,
    isTesting: boolean
  ) => {
    try {
      await sendInvoiceEmailToClient({
        invoiceId: invoiceData.id,
        clientId: selectedClient?.id,
        clientName: selectedClient?.name,
        projectName: invoiceData.project?.name,
        amount: Math.round(invoiceData.total / 100),
        chargeDate: dayjs
          .unix(invoiceData.dbInvoiceObject.chargeDate)
          .format("YYYY-MM-DD"),
        description: invoiceData.description,
        invoiceSendDate: dayjs().format("YYYY-MM-DD"),
        testing: isTesting,
      });
      setSnackbar({
        open: true,
        message: isTesting
          ? "Test invoice email sent successfully"
          : "Invoice email sent successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error sending invoice email:", error);
      setSnackbar({
        open: true,
        message: `Failed to send ${isTesting ? "test " : ""}invoice email`,
        severity: "error",
      });
    }
  };

  // Define table columns
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "project.name",
        header: "Project",
        Cell: ({ row }) => row.original.project?.name || "-",
        size: 180,
      },
      {
        accessorKey: "total",
        header: "Total Amount",
        // converting to dollars
        Cell: ({ row }) => formatAmount(row.original.total / 100),
        size: 150,
      },
      {
        accessorKey: "dbInvoiceObject.chargeDate",
        header: "Due Date",
        Cell: ({ row }) =>
          row.original.dbInvoiceObject.chargeDate
            ? dayjs
                .unix(row.original.dbInvoiceObject.chargeDate)
                .format("DD/MM/YYYY")
            : "-",
        size: 150,
      },
      {
        accessorKey: "created",
        header: "Created At",
        Cell: ({ row }) => formatTimestampsDate(row.original.created),
        size: 150,
      },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ row }) => (
          <Chip
            label={row.original.status.toUpperCase()}
            color={
              row.original.status === "paid"
                ? "success"
                : row.original.status === "pending"
                ? "warning"
                : row.original.status === "draft"
                ? "secondary"
                : "info"
            }
            size="small"
            sx={{ fontWeight: "medium" }}
          />
        ),
        size: 120,
      },
      {
        id: "actions",
        header: "Actions",
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            {isSuperAdmin && (
              <>
                <Tooltip title="Delete invoice">
                  <IconButton
                    disabled={
                      row.original.status_transitions.finalized_at !== null
                    }
                    onClick={() =>
                      handleDeleteClick(
                        row.original.id,
                        row.original.dbInvoiceObject.id
                      )
                    }
                    size="small"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Email Invoice">
                  <IconButton
                    onClick={() => handleSendInvoiceEmail(row.original, false)}
                    size="small"
                    color="primary"
                    disabled={sendInvoiceEmailToClientIsLoading}
                  >
                    {sendInvoiceEmailToClientIsLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <SendIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Test Email Invoice">
                  <IconButton
                    onClick={() => handleSendInvoiceEmail(row.original, true)}
                    size="small"
                    color="info"
                    disabled={sendInvoiceEmailToClientIsLoading}
                  >
                    <BugReportIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {row.original.status === "paid" && row.original.invoice_pdf ? (
              <Tooltip title="Download PDF">
                <IconButton
                  onClick={() =>
                    window.open(row.original.invoice_pdf, "_blank")
                  }
                  size="small"
                  color="primary"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <></>
            )}

            {isClient &&
            (row.original.status !== "paid" ||
              row.original.status! == "past_due") ? (
              <Tooltip title="Pay now">
                <IconButton
                  onClick={() => handlePayNow(row.original.id)}
                  size="small"
                  color="primary"
                  disabled={
                    processingPayment === row.original.id ||
                    payInvoiceNowIsLoading
                  }
                >
                  {processingPayment === row.original.id ? (
                    <CircularProgress size={16} />
                  ) : (
                    <PaymentIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            ) : (
              <></>
            )}
          </Box>
        ),
        align: "right",
        size: 100,
      },
    ],
    [
      isSuperAdmin,
      processingPayment,
      payInvoiceNowIsLoading,
      sendInvoiceEmailToClientIsLoading,
      selectedClient,
    ]
  );

  // Initialize table
  const table = useMaterialReactTable({
    columns,
    data: invoicesData || [],
    enableFullScreenToggle: false,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    initialState: { density: "compact" },
    muiPaginationProps: {
      rowsPerPageOptions: [10, 25, 50],
    },
    state: {
      isLoading: invoicesIsLoading,
    },
    renderEmptyRowsFallback: () => (
      <Box sx={{ textAlign: "center", p: 2 }}>
        <Typography variant="body1" color="textSecondary">
          No invoices found for this client.
        </Typography>
      </Box>
    ),
  });

  if (!selectedClient) {
    return (
      <Typography variant="h5" sx={{ padding: 3 }}>
        Please select a client to view invoices
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
        <Typography variant="h4">Invoices</Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <MaterialReactTable table={table} />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirmation}
        onClose={() => setOpenDeleteConfirmation(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this invoice? This action cannot be
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
            disabled={deleteInvoiceIsLoading}
          >
            {deleteInvoiceIsLoading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Invoices;
