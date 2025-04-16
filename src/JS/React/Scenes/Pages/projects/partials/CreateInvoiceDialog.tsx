import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { appTimezones } from "JS/types/constants";

interface CreateInvoiceDialogState {
  invoiceAmount: string;
  invoiceDescription: string;
  invoiceDate: Date | null;
  invoiceTime: Date | null;
  invoiceTimezone: string;
  amountError: string;
  isLoading: boolean;
}

interface CreateInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  state: CreateInvoiceDialogState;
  onChange: (field: keyof CreateInvoiceDialogState, value: any) => void;
  onCreateInvoice: () => Promise<void>;
}

export const CreateInvoiceDialog: React.FC<CreateInvoiceDialogProps> = ({
  open,
  onClose,
  state,
  onChange,
  onCreateInvoice,
}) => {
  // Using completely local state for form handling
  const [formState, setFormState] = useState({
    amount: state.invoiceAmount,
    description: state.invoiceDescription,
    amountError: state.amountError,
    date: state.invoiceDate,
    time: state.invoiceTime,
    timezone: state.invoiceTimezone,
  });

  // Update local state when dialog opens or resets
  useEffect(() => {
    if (open) {
      setFormState({
        amount: state.invoiceAmount,
        description: state.invoiceDescription,
        amountError: state.amountError,
        date: state.invoiceDate,
        time: state.invoiceTime,
        timezone: state.invoiceTimezone,
      });
    }
  }, [
    open,
    state.invoiceAmount,
    state.invoiceDescription,
    state.invoiceDate,
    state.invoiceTime,
    state.invoiceTimezone,
    state.amountError,
  ]);

  // Local update function - only updates local state for responsive UI
  const updateFormState = (field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle amount changes locally
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let error = "";

    // Validate amount locally
    if (value && !/^\d+(\.\d{0,2})?$/.test(value)) {
      error = "Please enter a valid amount";
    }

    // Only update local state for typing
    updateFormState("amount", value);
    updateFormState("amountError", error);
  };

  // Sync with parent state on blur
  const handleAmountBlur = () => {
    onChange("invoiceAmount", formState.amount);
    onChange("amountError", formState.amountError);
  };

  // Handle description changes locally
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormState("description", e.target.value);
  };

  // Sync with parent state on blur
  const handleDescriptionBlur = () => {
    onChange("invoiceDescription", formState.description);
  };

  // Handle date changes
  const handleDateChange = (newDate: Date | null) => {
    updateFormState("date", newDate);
    onChange("invoiceDate", newDate);
  };

  // Handle time changes
  const handleTimeChange = (newTime: Date | null) => {
    updateFormState("time", newTime);
    onChange("invoiceTime", newTime);
  };

  // Handle timezone changes
  const handleTimezoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateFormState("timezone", value);
    onChange("invoiceTimezone", value);
  };

  // Submit handler - ensure parent state is up-to-date before submitting
  const handleSubmit = async () => {
    // Sync all fields one last time
    onChange("invoiceAmount", formState.amount);
    onChange("invoiceDescription", formState.description);
    onChange("amountError", formState.amountError);

    // Then call the parent's submit function
    await onCreateInvoice();

    // Clear form state after successful submission
    const emptyState = {
      amount: "",
      description: "",
      amountError: "",
      date: null,
      time: null,
      timezone: formState.timezone, // Keep timezone as user preference
    };

    // Update local state
    setFormState(emptyState);

    // Update parent state
    onChange("invoiceAmount", "");
    onChange("invoiceDescription", "");
    onChange("amountError", "");
    onChange("invoiceDate", null);
    onChange("invoiceTime", null);
  };

  // Extract loading state from parent
  const { isLoading } = state;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        PaperProps={{
          sx: {
            maxWidth: "600px",
          },
        }}
      >
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount In Cents"
            type="text"
            fullWidth
            variant="outlined"
            value={formState.amount}
            onChange={handleAmountChange}
            onBlur={handleAmountBlur}
            error={!!formState.amountError}
            helperText={
              formState.amountError ||
              "Enter amount with up to 2 decimal places"
            }
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formState.description}
            onChange={handleDescriptionChange}
            onBlur={handleDescriptionBlur}
            placeholder="Enter invoice description (optional)"
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Charge Date"
                value={formState.date}
                onChange={handleDateChange}
                minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TimePicker
                label="Charge Time"
                value={formState.time}
                onChange={handleTimeChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Timezone"
                fullWidth
                variant="outlined"
                value={formState.timezone}
                onChange={handleTimezoneChange}
              >
                {appTimezones.map((tz) => (
                  <MenuItem key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={
              !formState.amount ||
              !!formState.amountError ||
              !formState.date ||
              !formState.time ||
              isLoading
            }
          >
            {isLoading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
