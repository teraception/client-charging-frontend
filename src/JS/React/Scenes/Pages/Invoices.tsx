import { useState } from "react";
import {
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import { useSelectedClient } from "JS/React/Context/SelectedClientContext";
import { useAccessHandler } from "JS/React/Hooks/AccessHandler";
import {
  useGetInvoicesByClient,
  useDeleteInvoice,
} from "JS/React/Hooks/Invoices/Hook";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";

const Invoices = () => {
  const { selectedClient } = useSelectedClient();
  const { isSuperAdmin } = useAccessHandler();
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [activeInvoiceData, setActiveInvoiceData] = useState<{
    invoiceId: string;
    dbInvoiceId: string;
  }>({
    invoiceId: "",
    dbInvoiceId: "",
  });

  // Get invoices for the selected client
  const { invoicesData, invoicesIsLoading, refetchInvoices } =
    useGetInvoicesByClient(selectedClient?.id || null);

  // Delete invoice mutation
  const { deleteInvoice, deleteInvoiceIsLoading } = useDeleteInvoice();

  // Handle delete invoice
  const handleDeleteClick = () => {
    setOpenDeleteConfirmation(true);
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
  const formatDate = (timestamp: number) => {
    return dayjs(timestamp * 1000).format("DD/MM/YYYY");
  };

  // Format amount to display with 2 decimal places
  const formatAmount = (amount: number) => {
    return `$${amount?.toFixed(2)}`;
  };

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

      {invoicesIsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : invoicesData.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="textSecondary">
            No invoices found for this client.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Status</TableCell>
                {isSuperAdmin && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {invoicesData.map((invoice: any) => (
                <TableRow key={invoice.dbInvoiceObject.id}>
                  <TableCell>{invoice.dbInvoiceObject.projectId}</TableCell>
                  <TableCell>{formatAmount(invoice.total)}</TableCell>
                  <TableCell>{formatDate(invoice.due_date)}</TableCell>
                  <TableCell>{formatDate(invoice.created)}</TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      color={
                        invoice.status === "paid"
                          ? "success"
                          : invoice.status === "pending"
                          ? "warning"
                          : invoice.status === "draft"
                          ? "secondary"
                          : "info"
                      }
                      size="small"
                      sx={{ fontWeight: "medium" }}
                    />
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell align="right">
                      {invoice.status_transitions.finalized_at == null && (
                        <IconButton
                          onClick={(e) => {
                            setActiveInvoiceData({
                              invoiceId: invoice.dbInvoiceObject.id,
                              dbInvoiceId: invoice.id,
                            });
                            handleDeleteClick();
                          }}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
    </Box>
  );
};

export default Invoices;
