import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

interface DeleteProjectDialogState {
  isLoading: boolean;
}

interface DeleteProjectDialogProps {
  open: boolean;
  onClose: () => void;
  state: DeleteProjectDialogState;
  onChange: (field: keyof DeleteProjectDialogState, value: any) => void;
  onConfirmDelete: () => Promise<void>;
}

export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  open,
  onClose,
  state,
  onConfirmDelete,
}) => {
  const { isLoading } = state;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this project? This action cannot be
          undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirmDelete}
          variant="contained"
          color="error"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
