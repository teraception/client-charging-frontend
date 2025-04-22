import { useState, useMemo } from "react";
import {
  Typography,
  Button,
  Box,
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
import { InvoiceDto, InvoiceStatus } from "JS/typingForNow/Invoice";

const Invoices = () => {
  const { selectedClient } = useSelectedClient();
  const { isSuperAdmin, isClient } = useAccessHandler();
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [openPayConfirmation, setOpenPayConfirmation] = useState(false);
  const [openSendEmailConfirmation, setOpenSendEmailConfirmation] =
    useState(false);
  const [isSendEmailTest, setIsSendEmailTest] = useState(false);
  const [activeInvoiceData, setActiveInvoiceData] = useState<{
    invoiceId: string;
    dbInvoiceId: string;
    invoiceDto?: InvoiceDto;
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

  // Handle pay now click
  const handlePayNowClick = (invoiceId: string) => {
    setActiveInvoiceData({
      invoiceId,
      dbInvoiceId: invoiceId,
    });
    setOpenPayConfirmation(true);
  };

  // Handle send email click
  const handleSendEmailClick = (
    invoiceData: InvoiceDto,
    isTesting: boolean
  ) => {
    setActiveInvoiceData({
      invoiceId: invoiceData.id || "",
      dbInvoiceId: invoiceData.id || "",
      invoiceDto: invoiceData,
    });
    setIsSendEmailTest(isTesting);
    setOpenSendEmailConfirmation(true);
  };

  // Handle pay now
  const handleConfirmPay = async () => {
    if (!activeInvoiceData.invoiceId) return;

    try {
      setProcessingPayment(activeInvoiceData.invoiceId);
      await payInvoiceNow(activeInvoiceData.invoiceId);
      refetchInvoices();
      setOpenPayConfirmation(false);
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

  // Handle confirm send invoice email
  const handleConfirmSendEmail = async () => {
    try {
      if (!activeInvoiceData.invoiceId) return;

      await sendInvoiceEmailToClient({
        invoiceId: activeInvoiceData.invoiceId,
        testing: isSendEmailTest,
      });

      setOpenSendEmailConfirmation(false);
      setSnackbar({
        open: true,
        message: isSendEmailTest
          ? "Test invoice email sent successfully"
          : "Invoice email sent successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error sending invoice email:", error);
      setSnackbar({
        open: true,
        message: `Failed to send ${
          isSendEmailTest ? "test " : ""
        }invoice email`,
        severity: "error",
      });
    }
  };

  // Handle send invoice email (original function, now redirects to dialog)
  const handleSendInvoiceEmail = async (
    invoiceData: InvoiceDto,
    isTesting: boolean
  ) => {
    handleSendEmailClick(invoiceData, isTesting);
  };

  // Define table columns
  const columns = useMemo<MRT_ColumnDef<InvoiceDto>[]>(
    () => [
      {
        accessorKey: "project.name",
        header: "Project",
        Cell: ({ row }) => row.original.project?.name || "-",
        size: 180,
      },
      {
        accessorKey: "amount",
        header: "Total Amount",
        // converting cents to dollars
        Cell: ({ row }) => formatAmount(row.original.amount / 100),
        size: 150,
      },
      {
        accessorKey: "chargeDayTime",
        header: "Due Date",
        Cell: ({ row }) =>
          row.original.chargeDayTime
            ? formatTimestampsDate(row.original.chargeDayTime)
            : "-",
        size: 150,
      },
      {
        accessorKey: "scheduleDate",
        header: "Schedule Date",
        Cell: ({ row }) =>
          row.original.sendDateTime
            ? formatTimestampsDate(row.original.sendDateTime)
            : "-",
        size: 150,
      },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ row }) => (
          <Chip
            label={row.original.status || "-"}
            color={
              row.original.status === InvoiceStatus.PAID
                ? "success"
                : row.original.status === InvoiceStatus.OVERDUE
                ? "error"
                : row.original.status === InvoiceStatus.DRAFT
                ? "secondary"
                : "warning"
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
                    onClick={() =>
                      handleDeleteClick(
                        row.original.id || "",
                        row.original.id || ""
                      )
                    }
                    size="small"
                    color="error"
                    disabled={!row.original.id}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Email Invoice">
                  <IconButton
                    onClick={() => handleSendInvoiceEmail(row.original, false)}
                    size="small"
                    color="primary"
                    disabled={
                      sendInvoiceEmailToClientIsLoading || !row.original.id
                    }
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
                    disabled={
                      sendInvoiceEmailToClientIsLoading || !row.original.id
                    }
                  >
                    <BugReportIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {isClient && row.original.status !== InvoiceStatus.PAID ? (
              <Tooltip title="Pay now">
                <IconButton
                  onClick={() =>
                    row.original.id && handlePayNowClick(row.original.id)
                  }
                  size="small"
                  color="primary"
                  disabled={
                    processingPayment === row.original.id ||
                    payInvoiceNowIsLoading ||
                    !row.original.id
                  }
                >
                  {processingPayment === row.original.id ? (
                    <CircularProgress size={16} />
                  ) : (
                    <PaymentIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            ) : null}
          </Box>
        ),
        align: "right",
        size: 180,
      },
    ],
    [
      isSuperAdmin,
      isClient,
      processingPayment,
      payInvoiceNowIsLoading,
      sendInvoiceEmailToClientIsLoading,
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

      {/* Pay Now Confirmation Dialog */}
      <Dialog
        open={openPayConfirmation}
        onClose={() => setOpenPayConfirmation(false)}
      >
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to process this payment now?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayConfirmation(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmPay}
            variant="contained"
            color="primary"
            disabled={payInvoiceNowIsLoading}
          >
            {payInvoiceNowIsLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Pay Now"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Email Confirmation Dialog */}
      <Dialog
        open={openSendEmailConfirmation}
        onClose={() => setOpenSendEmailConfirmation(false)}
      >
        <DialogTitle>Confirm Send Email</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{" "}
            {isSendEmailTest ? "send a test email" : "send the invoice email"}{" "}
            to the client?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSendEmailConfirmation(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSendEmail}
            variant="contained"
            color="primary"
            disabled={sendInvoiceEmailToClientIsLoading}
          >
            {sendInvoiceEmailToClientIsLoading ? (
              <CircularProgress size={24} />
            ) : isSendEmailTest ? (
              "Send Test Email"
            ) : (
              "Send Email"
            )}
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
