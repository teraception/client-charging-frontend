import { useState } from "react";
import AppDialog from "../../../Components/AppDialog";
import AppDialogTitle from "../../../Components/AppDialogTitle";
import AppDialogContent from "../../../Components/AppDialogContent";
import AppDialogFooter from "../../../Components/AppDialogFooter";
import AppButton from "../../../Components/AppButton";
import AppTextField from "../../../Components/AppTextField";
import { DialogActions } from "@mui/material";

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

interface InviteClientDialogProps {
  open: boolean;
  onClose: () => void;
  onInvite: (data: { name: string; email: string }) => Promise<void>;
  loading: boolean;
}

interface InviteFormState {
  name: string;
  email: string;
  nameError: string;
  emailError: string;
}

export const InviteClientDialog = ({
  open,
  onClose,
  onInvite,
  loading,
}: InviteClientDialogProps) => {
  const [inviteForm, setInviteForm] = useState<InviteFormState>({
    name: "",
    email: "",
    nameError: "",
    emailError: "",
  });

  const validateEmail = (email: string) => {
    if (!email) {
      setInviteForm((prev) => ({ ...prev, emailError: "Email is required" }));
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setInviteForm((prev) => ({
        ...prev,
        emailError: "Please enter a valid email address",
      }));
      return false;
    }
    setInviteForm((prev) => ({ ...prev, emailError: "" }));
    return true;
  };

  const validateName = (name: string) => {
    if (!name) {
      setInviteForm((prev) => ({ ...prev, nameError: "Name is required" }));
      return false;
    }
    setInviteForm((prev) => ({ ...prev, nameError: "" }));
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setInviteForm((prev) => ({ ...prev, email }));
    validateEmail(email);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setInviteForm((prev) => ({ ...prev, name }));
    validateName(name);
  };

  const handleInvite = async () => {
    if (validateEmail(inviteForm.email) && validateName(inviteForm.name)) {
      await onInvite({ name: inviteForm.name, email: inviteForm.email });
      setInviteForm({
        name: "",
        email: "",
        nameError: "",
        emailError: "",
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
        },
      }}
    >
      <AppDialogTitle>Invite Client</AppDialogTitle>
      <AppDialogContent>
        <AppTextField
          label="Name"
          value={inviteForm.name}
          onChange={handleNameChange}
          fullWidth
          margin="normal"
          error={!!inviteForm.nameError}
          helperText={inviteForm.nameError}
        />
        <AppTextField
          label="Email"
          value={inviteForm.email}
          onChange={handleEmailChange}
          fullWidth
          margin="normal"
          error={!!inviteForm.emailError}
          helperText={inviteForm.emailError}
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
            onClick={handleInvite}
            disabled={
              !inviteForm.email ||
              !inviteForm.name ||
              !!inviteForm.emailError ||
              !!inviteForm.nameError ||
              loading
            }
          >
            Invite
          </AppButton>
        </DialogActions>
      </AppDialogFooter>
    </AppDialog>
  );
};
