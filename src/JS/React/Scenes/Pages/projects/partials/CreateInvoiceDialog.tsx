import React, { useState, useEffect, useRef } from "react";
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
  Box,
  IconButton,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  MobileTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { appTimezones, currencies } from "JS/types/constants";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";

// Helper function to convert Date to epoch seconds (not milliseconds)
const dateToEpochSeconds = (date: Date | null): number => {
  return date ? Math.floor(date.getTime() / 1000) : 0;
};

interface CreateInvoiceDialogState {
  invoiceAmount: string;
  invoiceDescription: string;
  invoiceDate: Date | null;
  invoiceTime: Date | null;
  invoiceTimezone: string;
  invoiceCurrency: string;
  chargeDays: string;
  chargeTime: Date | null;
  shortId: string;
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
    currency: state.invoiceCurrency,
    chargeDays: state.chargeDays,
    chargeTime: state.chargeTime,
    shortId: state.shortId,
    files: [] as File[],
  });

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        currency: state.invoiceCurrency,
        chargeDays: state.chargeDays,
        chargeTime: state.chargeTime,
        shortId: state.shortId,
        files: [],
      });
    }
  }, [
    open,
    state.invoiceAmount,
    state.invoiceDescription,
    state.invoiceDate,
    state.invoiceTime,
    state.invoiceTimezone,
    state.invoiceCurrency,
    state.chargeDays,
    state.chargeTime,
    state.shortId,
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
      error = "Please enter a valid dollar amount";
    }

    // Validate that amount doesn't exceed six figures
    if (value && parseFloat(value) > 999999.99) {
      error = "Amount cannot exceed $999,999.99";
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

  // Handle currency changes
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateFormState("currency", value);
    onChange("invoiceCurrency", value);
  };

  // Handle charge days changes
  const handleChargeDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive integers
    if (value === "" || /^\d+$/.test(value)) {
      updateFormState("chargeDays", value);
      onChange("chargeDays", value);
    }
  };

  // Handle charge time changes
  const handleChargeTimeChange = (newTime: Date | null) => {
    updateFormState("chargeTime", newTime);
    onChange("chargeTime", newTime);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setFormState((prev) => ({
        ...prev,
        files: [...prev.files, ...filesArray],
      }));
    }
  };

  // Handle file removal
  const handleFileRemove = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Add a handler for shortId changes
  const handleShortIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateFormState("shortId", value);
    onChange("shortId", value);
  };

  // Submit handler - ensure parent state is up-to-date before submitting
  const handleSubmit = async () => {
    // Calculate schedule date/time in epoch seconds
    let sendDateTime = 0;
    if (formState.date && formState.time) {
      const scheduleDate = new Date(formState.date);
      const scheduleTime = new Date(formState.time);

      scheduleDate.setHours(
        scheduleTime.getHours(),
        scheduleTime.getMinutes(),
        scheduleTime.getSeconds()
      );

      sendDateTime = dateToEpochSeconds(scheduleDate);
    }

    // Calculate charge date/time in epoch seconds
    let chargeDayTime = 0;
    if (formState.date && formState.chargeTime && formState.chargeDays) {
      const chargeDate = new Date(formState.date);
      const chargeTime = new Date(formState.chargeTime);

      // Add the specified number of days
      chargeDate.setDate(chargeDate.getDate() + parseInt(formState.chargeDays));

      // Set the time
      chargeDate.setHours(
        chargeTime.getHours(),
        chargeTime.getMinutes(),
        chargeTime.getSeconds()
      );

      chargeDayTime = dateToEpochSeconds(chargeDate);
    }

    // Sync all fields one last time
    onChange("invoiceAmount", formState.amount);
    onChange("invoiceDescription", formState.description);
    onChange("amountError", formState.amountError);
    onChange("invoiceCurrency", formState.currency);
    onChange("chargeDays", formState.chargeDays);
    onChange("chargeTime", formState.chargeTime);
    onChange("shortId", formState.shortId);

    // Create a new DataTransfer object to synchronize files with the file input
    if (formState.files.length > 0 && fileInputRef.current) {
      try {
        const dataTransfer = new DataTransfer();
        formState.files.forEach((file) => {
          dataTransfer.items.add(file);
        });

        // Update the file input's files property to match our local state
        fileInputRef.current.files = dataTransfer.files;
      } catch (err) {
        console.error("Failed to sync files with file input:", err);
      }
    }

    // Call the parent's submit function
    await onCreateInvoice();

    // Clear form state after successful submission
    const emptyState = {
      amount: "",
      description: "",
      amountError: "",
      date: null,
      time: null,
      timezone: formState.timezone, // Keep timezone as user preference
      currency: formState.currency, // Keep currency as user preference
      chargeDays: "",
      chargeTime: null,
      shortId: "",
      files: [],
    };

    // Update local state
    setFormState(emptyState);

    // Update parent state
    onChange("invoiceAmount", "");
    onChange("invoiceDescription", "");
    onChange("amountError", "");
    onChange("invoiceDate", null);
    onChange("invoiceTime", null);
    onChange("chargeDays", "");
    onChange("chargeTime", null);
    onChange("shortId", "");
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
            maxWidth: "700px",
          },
        }}
      >
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={3}>
              <TextField
                autoFocus
                margin="dense"
                label="Amount"
                type="text"
                fullWidth
                variant="outlined"
                value={formState.amount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                error={!!formState.amountError}
                helperText={
                  formState.amountError ||
                  "Enter amount in dollars (e.g., 10.99)"
                }
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Currency"
                fullWidth
                variant="outlined"
                value={formState.currency}
                onChange={handleCurrencyChange}
                sx={{ mt: 1 }}
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Short ID"
                type="text"
                fullWidth
                variant="outlined"
                value={formState.shortId}
                onChange={handleShortIdChange}
                placeholder="Enter a unique ID"
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>

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

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Schedule Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Schedule Date"
                value={formState.date}
                onChange={handleDateChange}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <MobileTimePicker
                label="Schedule Time"
                value={formState.time}
                onChange={handleTimeChange}
                views={["hours", "minutes"]}
                ampm
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

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Charge Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Charge After (Days)"
                type="text"
                fullWidth
                variant="outlined"
                value={formState.chargeDays}
                onChange={handleChargeDaysChange}
                placeholder="Enter number of days"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MobileTimePicker
                label="Charge Time"
                value={formState.chargeTime}
                onChange={handleChargeTimeChange}
                views={["hours", "minutes"]}
                ampm
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Attachments
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={handleUploadClick}
              sx={{ mr: 2 }}
            >
              Upload Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              style={{ display: "none" }}
              id="invoice-file-input"
            />
            <Typography variant="body2" color="text.secondary">
              {formState.files.length} file(s) selected
            </Typography>
          </Box>

          {formState.files.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {formState.files.map((file, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1,
                    borderRadius: 1,
                    bgcolor: "background.paper",
                    mb: 0.5,
                  }}
                >
                  <AttachFileIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      flexGrow: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {file.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleFileRemove(index)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
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
              !formState.currency ||
              !formState.chargeDays ||
              !formState.chargeTime ||
              !formState.shortId ||
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
