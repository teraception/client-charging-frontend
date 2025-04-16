import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { SelectComponent } from "JS/React/Components/SelectComponent";

interface PaymentMethod {
  id: string;
  card?: {
    brand?: string;
    last4?: string;
  };
}

interface PaymentMethodsDialogState {
  selectedPaymentMethodIds: string[];
  isLoading: boolean;
  paymentMethodsLoading: boolean;
}

interface PaymentMethodsDialogProps {
  open: boolean;
  onClose: () => void;
  projectName: string;
  state: PaymentMethodsDialogState;
  onChange: (field: keyof PaymentMethodsDialogState, value: any) => void;
  paymentMethods: PaymentMethod[];
  onUpdatePaymentMethods: () => Promise<void>;
}

export const PaymentMethodsDialog: React.FC<PaymentMethodsDialogProps> = ({
  open,
  onClose,
  projectName,
  state,
  onChange,
  paymentMethods,
  onUpdatePaymentMethods,
}) => {
  const { selectedPaymentMethodIds, isLoading, paymentMethodsLoading } = state;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxHeight: "500px",
          overflow: "visible",
          maxWidth: "500px",
          width: "100%",
          position: "relative",
          zIndex: 1200,
        },
      }}
    >
      <DialogTitle>
        Update Payment Methods for {projectName || "Project"}
      </DialogTitle>
      <DialogContent sx={{ overflow: "visible", position: "relative" }}>
        {paymentMethodsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : paymentMethods.length === 0 ? (
          <Typography variant="body1" color="textSecondary" sx={{ py: 2 }}>
            No payment methods available. Please add payment methods first.
          </Typography>
        ) : (
          <Box sx={{ position: "relative", zIndex: 1300 }}>
            {/* Display currently selected payment methods */}
            {selectedPaymentMethodIds.length > 0 && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: "#f0f7ff",
                  borderRadius: 1,
                  border: "1px solid #b3d1ff",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "#0047b3" }}
                >
                  Currently Selected Payment Method:
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {selectedPaymentMethodIds.map((id) => {
                    const method = paymentMethods.find((m) => m.id === id);
                    return method ? (
                      <Typography key={id} variant="body2">
                        {method.card?.brand?.toUpperCase() || "CARD"} ****{" "}
                        {method.card?.last4 || "****"}
                      </Typography>
                    ) : (
                      <Typography
                        key={id}
                        variant="body2"
                        color="text.secondary"
                      >
                        Unknown payment method ({id})
                      </Typography>
                    );
                  })}
                </Box>
              </Box>
            )}

            <SelectComponent
              title="Payment Methods"
              placeholder="Select payment methods"
              options={(paymentMethods || []).map((method) => ({
                value: method.id,
                label: `${method.card?.brand?.toUpperCase() || "CARD"} **** ${
                  method.card?.last4 || "****"
                }`,
              }))}
              selectedValues={selectedPaymentMethodIds}
              onChange={(values) => {
                // If single value returned (not array), wrap in array
                const newValues = Array.isArray(values)
                  ? values
                  : values?.value
                  ? [values.value]
                  : [];
                onChange("selectedPaymentMethodIds", newValues);
              }}
              isMulti={false}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onUpdatePaymentMethods}
          variant="contained"
          color="primary"
          disabled={
            isLoading || paymentMethods.length === 0 || paymentMethodsLoading
          }
        >
          {isLoading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
