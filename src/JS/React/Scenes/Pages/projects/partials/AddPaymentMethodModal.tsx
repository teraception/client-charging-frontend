import React from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { StripeIndex } from "JS/React/stripe/Index";

interface AddPaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string | null;
  clientId: string | null;
  onSuccess: () => void;
}

export const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  open,
  onClose,
  projectId,
  clientId,
  onSuccess,
}) => {
  if (!clientId || !projectId) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxWidth: "550px",
          width: "100%",
          position: "relative",
          zIndex: 1200,
        },
      }}
    >
      <DialogTitle>Add Payment Method</DialogTitle>
      <DialogContent>
        <StripeIndex forProject={true} payload={{ clientId, projectId }} />
      </DialogContent>
    </Dialog>
  );
};
