import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Paper,
  Link,
  Stack,
} from "@mui/material";
import { InvoiceDto } from "JS/typingForNow/Invoice";
import dayjs from "dayjs";
import numeral from "numeral";
import AttachFileIcon from "@mui/icons-material/AttachFile";

interface InvoicePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: InvoiceDto | null;
}

const InvoicePreviewDialog: React.FC<InvoicePreviewDialogProps> = ({
  open,
  onClose,
  invoice,
}) => {
  if (!invoice) return null;

  // Format amount to display with currency and commas
  const formatAmount = (amount: number) => {
    return numeral(amount / 100).format("$0,0.00");
  };

  const issueDate = invoice.sendDateTime
    ? dayjs(invoice.sendDateTime * 1000).format("DD/MM/YYYY")
    : "-";

  const chargeDate = invoice.chargeDayTime
    ? dayjs(invoice.chargeDayTime * 1000).format("DD/MM/YYYY")
    : "-";

  const companyTitle = invoice.previewInvoiceMeta?.companyTitle || "Company";
  const contactEmail = invoice.previewInvoiceMeta?.contactEmail || "-";
  const contactPhone = invoice.previewInvoiceMeta?.contactPhone || "-";
  const attachmentLinks = invoice.previewInvoiceMeta?.attachmentLinks || [];
  const formattedAmount = formatAmount(invoice.amount);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{ sx: { maxWidth: "500px" } }}
    >
      <DialogTitle>
        <Typography variant="h5">Invoice Preview</Typography>
      </DialogTitle>
      <DialogContent
        sx={{ backgroundColor: "#f8f9fa", padding: "20px 24px !important" }}
      >
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {/* Top Card Section */}
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Invoice from {companyTitle}
            </Typography>

            <Typography variant="h4" fontWeight="bold" sx={{ my: 1.5 }}>
              {formattedAmount}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Issue date: {issueDate}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Charge date: {chargeDate}
            </Typography>

            {attachmentLinks.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Attachments:
                </Typography>
                {attachmentLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link}
                    underline="none"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "primary.main",
                      my: 0.5,
                    }}
                  >
                    <AttachFileIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">View attachment</Typography>
                  </Link>
                ))}
              </Box>
            )}
          </Box>

          {/* Bottom Card Section */}
          <Box sx={{ borderTop: 1, borderColor: "divider", p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>To:</strong> {invoice.client?.name || "-"}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>From:</strong> {companyTitle}
            </Typography>

            {/* Invoice Details */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Invoice #{invoice.shortId || invoice.id}</strong>
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  my: 2,
                }}
              >
                <Typography variant="body2">
                  {invoice.project?.name || "-"}
                </Typography>
                <Typography variant="body2">{formattedAmount}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2">Total due</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formattedAmount}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2">Amount paid</Typography>
                  <Typography variant="body2">$0.00</Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2">Amount remaining</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formattedAmount}
                  </Typography>
                </Box>
              </Stack>

              {invoice.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Description:
                  </Typography>
                  <Typography variant="body2">{invoice.description}</Typography>
                </Box>
              )}

              <Box
                sx={{
                  mt: 3,
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                <Typography variant="body2">
                  Questions? Contact us at{" "}
                  <Link href={`mailto:${contactEmail}`} color="primary">
                    {contactEmail}
                  </Link>{" "}
                  or call
                  <br />
                  us at{" "}
                  <Link href={`tel:${contactPhone}`} color="primary">
                    {contactPhone}
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoicePreviewDialog;
