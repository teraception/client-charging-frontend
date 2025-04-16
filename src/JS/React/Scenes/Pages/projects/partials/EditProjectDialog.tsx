import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { Project } from "JS/typingForNow/types";

interface EditProjectDialogState {
  editingProject: Project | null;
  isLoading: boolean;
}

interface EditProjectDialogProps {
  open: boolean;
  onClose: () => void;
  state: EditProjectDialogState;
  onChange: (field: keyof EditProjectDialogState, value: any) => void;
  onUpdateProject: () => Promise<void>;
}

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  open,
  onClose,
  state,
  onChange,
  onUpdateProject,
}) => {
  const { editingProject, isLoading } = state;

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingProject) {
      onChange("editingProject", {
        ...editingProject,
        name: e.target.value,
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Project</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Project Name"
          type="text"
          fullWidth
          variant="outlined"
          value={editingProject?.name || ""}
          onChange={handleProjectNameChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onUpdateProject}
          variant="contained"
          color="primary"
          disabled={!editingProject?.name?.trim() || isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
