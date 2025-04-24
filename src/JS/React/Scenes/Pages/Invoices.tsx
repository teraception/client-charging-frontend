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
  TextField,
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
import PaymentIcon from "@mui/icons-material/Payment";
import BugReportIcon from "@mui/icons-material/BugReport";
import VisibilityIcon from "@mui/icons-material/Visibility";
import dayjs from "dayjs";
import numeral from "numeral";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ColumnDef,
} from "material-react-table";
import { InvoiceDto, InvoiceStatus } from "JS/typingForNow/Invoice";
import InvoicePreviewDialog from "JS/React/Scenes/Partials/Invoices/InvoicePreviewDialog";

const Invoices = () => {
  const { selectedClient } = useSelectedClient();
  const { isSuperAdmin, isClient } = useAccessHandler();
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [openPayConfirmation, setOpenPayConfirmation] = useState(false);
  const [openSendEmailConfirmation, setOpenSendEmailConfirmation] =
    useState(false);
  const [openTestEmailDialog, setOpenTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [emailError, setEmailError] = useState("");
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
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(
    null
  );
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);

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

    if (isTesting) {
      setOpenTestEmailDialog(true);
    } else {
      setOpenSendEmailConfirmation(true);
    }
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
    return dayjs(timestamp * 1000).format("DD/MM/YYYY - h:mm A");
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

      const response = await sendInvoiceEmailToClient({
        invoiceId: activeInvoiceData.invoiceId,
        testing: isSendEmailTest,
        email: isSendEmailTest ? testEmailAddress : undefined,
      });

      setOpenSendEmailConfirmation(false);
      setOpenTestEmailDialog(false);
      setTestEmailAddress("");
      if (response) {
        setSnackbar({
          open: true,
          message: isSendEmailTest
            ? `Test invoice email sent successfully to ${testEmailAddress}`
            : "Invoice email sent successfully",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error sending invoice email:", error);
      // setSnackbar({
      //   open: true,
      //   message: `Failed to send ${
      //     isSendEmailTest ? "test " : ""
      //   }invoice email`,
      //   severity: "error",
      // });
    }
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTestEmailAddress(value);

    if (!value) {
      setEmailError("Email address is required");
    } else if (!validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  // Handle test email dialog confirmation
  const handleTestEmailConfirm = () => {
    if (!validateEmail(testEmailAddress)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setOpenTestEmailDialog(false);
    setOpenSendEmailConfirmation(true);
  };

  // Handle send invoice email (original function, now redirects to dialog)
  const handleSendInvoiceEmail = async (
    invoiceData: InvoiceDto,
    isTesting: boolean
  ) => {
    handleSendEmailClick(invoiceData, isTesting);
  };

  // Handle preview invoice
  const handlePreviewInvoice = (invoice: InvoiceDto) => {
    setSelectedInvoice(invoice);
    setOpenPreviewDialog(true);
  };

  // Define table columns
  const columns = useMemo<MRT_ColumnDef<InvoiceDto>[]>(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: "Invoice Number",
        Cell: ({ row }) => row.original.shortId || "-",
        size: 180,
      },
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
        accessorKey: "scheduleDate",
        header: "Schedule Date",
        Cell: ({ row }) =>
          row.original.sendDateTime
            ? formatTimestampsDate(row.original.sendDateTime)
            : "-",
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
        accessorKey: "paidAt",
        header: "Paid At",
        Cell: ({ row }) =>
          row.original.paidAt ? formatTimestampsDate(row.original.paidAt) : "-",
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
            <Tooltip title="View Invoice">
              <IconButton
                onClick={() => handlePreviewInvoice(row.original)}
                size="small"
                color="primary"
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {isSuperAdmin && (
              <>
                <Tooltip title="Test Email Invoice">
                  <IconButton
                    onClick={() => handleSendInvoiceEmail(row.original, true)}
                    size="small"
                    color="info"
                    disabled={
                      sendInvoiceEmailToClientIsLoading ||
                      !row.original.id ||
                      row.original.status === InvoiceStatus.PAID
                    }
                  >
                    <BugReportIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
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
                    disabled={
                      !row.original.id ||
                      (row.original.status !== InvoiceStatus.DRAFT &&
                        row.original.status !== InvoiceStatus.SCHEDULED)
                    }
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {isClient ? (
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
                    !row.original.id ||
                    row.original.status === InvoiceStatus.PAID
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
            {isSendEmailTest
              ? `send a test email to ${testEmailAddress}`
              : "send the invoice email"}{" "}
            {isSendEmailTest ? "" : "to the client"}?
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
            disabled={
              sendInvoiceEmailToClientIsLoading ||
              (isSendEmailTest && !testEmailAddress)
            }
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

      {/* Test Email Dialog */}
      <Dialog
        open={openTestEmailDialog}
        onClose={() => setOpenTestEmailDialog(false)}
      >
        <DialogTitle>Enter Test Email Address</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Please enter the email address where you'd like to send the test
            invoice email:
          </Typography>
          <TextField
            autoFocus
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={testEmailAddress}
            onChange={handleEmailChange}
            placeholder="example@email.com"
            error={!!emailError}
            helperText={emailError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTestEmailDialog(false)}>Cancel</Button>
          <Button
            onClick={handleTestEmailConfirm}
            variant="contained"
            color="primary"
            disabled={!testEmailAddress || !!emailError}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Preview Dialog */}
      <InvoicePreviewDialog
        open={openPreviewDialog}
        onClose={() => setOpenPreviewDialog(false)}
        invoice={selectedInvoice}
      />

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
