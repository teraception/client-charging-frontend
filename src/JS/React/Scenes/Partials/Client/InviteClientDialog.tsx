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
  onInvite: (email: string) => Promise<void>;
  loading: boolean;
}

export const InviteClientDialog = ({
  open,
  onClose,
  onInvite,
  loading,
}: InviteClientDialogProps) => {
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setInviteEmail(email);
    validateEmail(email);
  };

  const handleInvite = async () => {
    if (validateEmail(inviteEmail)) {
      await onInvite(inviteEmail);
      setInviteEmail("");
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
          label="Email"
          value={inviteEmail}
          onChange={handleEmailChange}
          fullWidth
          margin="normal"
          error={!!emailError}
          helperText={emailError}
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
            disabled={!inviteEmail || !!emailError || loading}
          >
            Invite
          </AppButton>
        </DialogActions>
      </AppDialogFooter>
    </AppDialog>
  );
};
