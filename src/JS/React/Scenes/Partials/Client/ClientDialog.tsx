import { useState, useEffect } from "react";
import AppDialog from "../../../Components/AppDialog";
import AppDialogTitle from "../../../Components/AppDialogTitle";
import AppDialogContent from "../../../Components/AppDialogContent";
import AppDialogFooter from "../../../Components/AppDialogFooter";
import AppButton from "../../../Components/AppButton";
import AppTextField from "../../../Components/AppTextField";
import { DialogActions } from "@mui/material";
import {
  Client,
  CreateClientDTO,
  UpdateClientDTO,
} from "JS/typingForNow/types";

interface ClientDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateClientDTO | UpdateClientDTO) => Promise<void>;
  loading: boolean;
  client?: Client;
  mode: "create" | "edit";
}

interface ClientFormState {
  name: string;
  nameError: string;
}

export const ClientDialog = ({
  open,
  onClose,
  onSave,
  loading,
  client,
  mode,
}: ClientDialogProps) => {
  const [clientForm, setClientForm] = useState<ClientFormState>({
    name: "",
    nameError: "",
  });

  useEffect(() => {
    // Reset form when dialog opens/closes or mode changes
    if (open) {
      if (mode === "edit" && client) {
        setClientForm({
          name: client.name || "",
          nameError: "",
        });
      } else {
        // Reset form for create mode
        setClientForm({
          name: "",
          nameError: "",
        });
      }
    }
  }, [open, mode, client]);

  const validateName = (name: string) => {
    if (!name) {
      setClientForm((prev) => ({ ...prev, nameError: "Name is required" }));
      return false;
    }
    setClientForm((prev) => ({ ...prev, nameError: "" }));
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setClientForm((prev) => ({ ...prev, name }));
    validateName(name);
  };

  const handleSave = async () => {
    if (validateName(clientForm.name)) {
      const data = { name: clientForm.name };
      await onSave(data);
      setClientForm({
        name: "",
        nameError: "",
      });
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "500px!important",
          maxHeight: "90vh",
          overflow: "visible",
        },
      }}
    >
      <AppDialogTitle>
        {mode === "create" ? "Create Client" : "Edit Client"}
      </AppDialogTitle>
      <AppDialogContent sx={{ overflow: "visible" }}>
        <AppTextField
          label="Name"
          value={clientForm.name}
          onChange={handleNameChange}
          fullWidth
          margin="normal"
          error={!!clientForm.nameError}
          helperText={clientForm.nameError}
        />
      </AppDialogContent>
      <AppDialogFooter>
        <DialogActions>
          <AppButton variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </AppButton>
          <AppButton
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!clientForm.name || !!clientForm.nameError || loading}
          >
            {mode === "create" ? "Create" : "Update"}
          </AppButton>
        </DialogActions>
      </AppDialogFooter>
    </AppDialog>
  );
};
