import React, { useState } from "react";
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
  TextField,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import { useSelectedClient } from "JS/React/Context/SelectedClientContext";
import { useAccessHandler } from "JS/React/Hooks/AccessHandler";
import {
  useGetInvoicesByClient,
  useCreateInvoice,
  useDeleteInvoice,
} from "JS/React/Hooks/Invoices/Hook";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import dayjs from "dayjs";

const Invoices = () => {
  const { selectedClient } = useSelectedClient();
  const { isSuperAdmin } = useAccessHandler();
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Get invoices for the selected client
  const { invoicesData, invoicesIsLoading, refetchInvoices } =
    useGetInvoicesByClient(selectedClient?.id || null);

  // Delete invoice mutation
  const { deleteInvoice, deleteInvoiceIsLoading } = useDeleteInvoice();

  // Handle menu open
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    invoiceId: string
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveInvoiceId(invoiceId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveInvoiceId(null);
  };

  // Handle delete invoice
  const handleDeleteClick = () => {
    setOpenDeleteConfirmation(true);
    handleMenuClose();
  };

  // Handle confirm delete invoice
  const handleConfirmDelete = async () => {
    if (!activeInvoiceId || !selectedClient) return;

    try {
      await deleteInvoice({
        invoiceId: activeInvoiceId,
        clientId: selectedClient.id,
      });

      setOpenDeleteConfirmation(false);
      refetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    console.log("098759127850c9821", timestamp);
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
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      color={
                        invoice.status === "paid"
                          ? "success"
                          : invoice.status === "pending"
                          ? "warning"
                          : "info"
                      }
                      size="small"
                      sx={{ fontWeight: "medium" }}
                    />
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell align="right">
                      {/* <IconButton
                        aria-label="more"
                        aria-controls="invoice-menu"
                        aria-haspopup="true"
                        onClick={(e) =>
                          handleMenuOpen(e, invoice.dbInvoiceObject.id!)
                        }
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton> */}
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

      {/* Invoice Menu */}
      <Menu
        id="invoice-menu"
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Invoices;
