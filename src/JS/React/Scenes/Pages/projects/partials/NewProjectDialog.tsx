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

interface NewProjectDialogProps {
  open: boolean;
  onClose: () => void;
  projectName: string;
  setProjectName: (name: string) => void;
  onCreateProject: () => Promise<void>;
  isLoading: boolean;
}

export const NewProjectDialog: React.FC<NewProjectDialogProps> = ({
  open,
  onClose,
  projectName,
  setProjectName,
  onCreateProject,
  isLoading,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Project</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Project Name"
          type="text"
          fullWidth
          variant="outlined"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onCreateProject}
          variant="contained"
          color="primary"
          disabled={!projectName.trim() || isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
