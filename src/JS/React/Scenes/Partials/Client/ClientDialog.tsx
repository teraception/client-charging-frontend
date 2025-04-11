import { useState, useEffect } from "react";
import AppDialog from "../../../Components/AppDialog";
import AppDialogTitle from "../../../Components/AppDialogTitle";
import AppDialogContent from "../../../Components/AppDialogContent";
import AppDialogFooter from "../../../Components/AppDialogFooter";
import AppButton from "../../../Components/AppButton";
import AppTextField from "../../../Components/AppTextField";
import { AppSelect } from "../../../Components/AppSelect";
import { DialogActions } from "@mui/material";
import {
  Client,
  CreateClientDTO,
  UpdateClientDTO,
} from "JS/typingForNow/types";
import { useGetAllUsers } from "JS/React/Hooks/Users";
import { Box, Typography } from "@mui/material";

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
  userId: string;
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
  const { getAllUsersResponse, usersData } = useGetAllUsers();
  const [clientForm, setClientForm] = useState<ClientFormState>({
    name: client?.name || "",
    userId: "",
    nameError: "",
  });

  console.log("607yncifu", clientForm);

  useEffect(() => {
    if (client) {
      setClientForm((prev) => ({
        ...prev,
        name: client.name,
      }));
    }
  }, [client]);

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

  const handleUserIdChange = (
    data: { value: string; label: string } | null
  ) => {
    setClientForm((prev) => ({ ...prev, userId: data?.value || "" }));
  };

  const getSelectedUser = () => {
    if (!clientForm.userId) return null;
    const user = usersData?.find((x) => x.id === clientForm.userId);
    return user ? { value: user.id, label: user.name || user.email } : null;
  };

  const handleSave = async () => {
    if (validateName(clientForm.name)) {
      const data =
        mode === "create"
          ? { name: clientForm.name, userId: clientForm.userId }
          : { name: clientForm.name };
      await onSave(data);
      setClientForm({
        name: "",
        userId: "",
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
        {mode === "create" && (
          <Box sx={{ mt: 2, position: "relative", zIndex: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, color: "text.secondary" }}
            >
              Assign User
            </Typography>
            <AppSelect
              label="Select User"
              value={getSelectedUser()}
              onChange={handleUserIdChange}
              options={
                usersData?.map((user) => ({
                  value: user.id,
                  label: user.name || user.email,
                })) || []
              }
              fullWidth
              margin="normal"
              disabled={loading}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                  },
                },
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.paper",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                },
                "& .MuiSelect-select": {
                  padding: "12px 14px",
                },
              }}
            />
          </Box>
        )}
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
            disabled={
              !clientForm.name ||
              !!clientForm.nameError ||
              (mode === "create" && !clientForm.userId) ||
              loading
            }
          >
            {mode === "create" ? "Create" : "Update"}
          </AppButton>
        </DialogActions>
      </AppDialogFooter>
    </AppDialog>
  );
};
