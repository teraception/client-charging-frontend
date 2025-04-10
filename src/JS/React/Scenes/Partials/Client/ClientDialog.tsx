import { useState, useEffect } from "react";
import AppDialog from "../../../Components/AppDialog";
import AppDialogTitle from "../../../Components/AppDialogTitle";
import AppDialogContent from "../../../Components/AppDialogContent";
import AppDialogFooter from "../../../Components/AppDialogFooter";
import AppButton from "../../../Components/AppButton";
import AppTextField from "../../../Components/AppTextField";
import { DialogActions } from "@mui/material";
import { Client } from "JS/typingForNow/types";

interface ClientDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Pick<Client, "name">) => Promise<void>;
  loading: boolean;
  client?: Client;
  mode: "create" | "edit";
}

export const ClientDialog = ({
  open,
  onClose,
  onSave,
  loading,
  client,
  mode,
}: ClientDialogProps) => {
  const [name, setName] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");

  useEffect(() => {
    if (mode === "edit" && client) {
      setName(client.name);
    } else {
      setName("");
    }
  }, [mode, client]);

  const validateName = (value: string) => {
    if (!value) {
      setNameError("Name is required");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    validateName(value);
  };

  const handleSave = async () => {
    if (validateName(name)) {
      await onSave({ name });
      setName("");
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      autoFocus
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "500px!important",
        },
      }}
    >
      <AppDialogTitle>
        {mode === "create" ? "Create Client" : "Edit Client"}
      </AppDialogTitle>
      <AppDialogContent>
        <AppTextField
          label="Name"
          value={name}
          onChange={handleNameChange}
          fullWidth
          margin="normal"
          error={!!nameError}
          helperText={nameError}
        />
      </AppDialogContent>
      <AppDialogFooter>
        <DialogActions>
          <AppButton
            variant="outlined"
            onClick={() => {
              setName("");
              setNameError("");
              onClose();
            }}
            disabled={loading}
          >
            Cancel
          </AppButton>
          <AppButton
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!name || !!nameError || loading}
          >
            {mode === "create" ? "Create" : "Save"}
          </AppButton>
        </DialogActions>
      </AppDialogFooter>
    </AppDialog>
  );
};
