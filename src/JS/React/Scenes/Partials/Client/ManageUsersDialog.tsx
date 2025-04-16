import { useState, useEffect } from "react";
import AppDialog from "../../../Components/AppDialog";
import AppDialogTitle from "../../../Components/AppDialogTitle";
import AppDialogContent from "../../../Components/AppDialogContent";
import AppDialogFooter from "../../../Components/AppDialogFooter";
import AppButton from "../../../Components/AppButton";
import {
  DialogActions,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Client, Role } from "JS/typingForNow/types";
import { AppSelect } from "../../../Components/AppSelect";
import { useGetAllUsers } from "JS/React/Hooks/Users";
import {
  useGetUsersListByClientId,
  useUpdateUserClientIds,
} from "JS/React/Hooks/Clients";
import { enqueueSnackbar } from "notistack";
import { StatusCode } from "JS/typingForNow/types";

interface ManageUsersDialogProps {
  open: boolean;
  onClose: () => void;
  client: Client;
}

export const ManageUsersDialog = ({
  open,
  onClose,
  client,
}: ManageUsersDialogProps) => {
  const { getAllUsersResponse, usersData } = useGetAllUsers();
  const { usersData: clientUsersData, getUsersListByClientIdLoader } =
    useGetUsersListByClientId(client?.id || "");

  const { updateUserClientIds, updateUserClientIdsLoader } =
    useUpdateUserClientIds();

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (clientUsersData) {
      setSelectedUserIds(clientUsersData.map((user) => user.id));
    }
  }, [clientUsersData]);

  const handleUserChange = (
    selected: { value: string; label: string }[] | null
  ) => {
    if (selected) {
      setSelectedUserIds(selected.map((item) => item.value));
    } else {
      setSelectedUserIds([]);
    }
  };

  const getSelectedUsers = () => {
    if (!selectedUserIds.length || !usersData) return [];

    return selectedUserIds
      .map((id) => {
        const user = usersData.find((user) => user.id === id);
        return user ? { value: user.id, label: user.name || user.email } : null;
      })
      .filter(Boolean);
  };

  const handleSave = async () => {
    try {
      const response = await updateUserClientIds({
        userIds: selectedUserIds,
        clientId: client.id,
      });

      if (response.statusCode === StatusCode.SUCCESS) {
        enqueueSnackbar("Users updated successfully", {
          variant: "success",
          autoHideDuration: 3000,
        });
        onClose();
      }
    } catch (error) {
      console.error("Error updating users:", error);
    }
  };

  const isLoading = getUsersListByClientIdLoader || updateUserClientIdsLoader;

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "600px!important",
          maxHeight: "90vh",
          overflow: "visible",
        },
      }}
    >
      <AppDialogTitle>Manage Users for {client?.name}</AppDialogTitle>
      <AppDialogContent sx={{ overflow: "visible" }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Select Users
            </Typography>
            <AppSelect
              label="Select Users"
              value={getSelectedUsers()}
              onChange={handleUserChange}
              options={
                usersData
                  ?.filter((x) => !x.role.includes(Role.SUPER_ADMIN))
                  .map((user) => ({
                    value: user.id,
                    label: user.name || user.email,
                  })) || []
              }
              isMulti
              fullWidth
              placeholder="Select users to assign to this client"
              margin="normal"
              disabled={isLoading}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    overflow: "visible",
                    zIndex: 9999,
                    position: "absolute",
                  },
                },
                style: {
                  zIndex: 9999,
                },
              }}
              sx={{
                minHeight: 50,
                position: "relative",
                zIndex: 1300,
                "& .MuiOutlinedInput-root": {
                  padding: 1,
                },
                "& .MuiChip-root": {
                  margin: "2px",
                },
                "& .MuiPaper-root": {
                  overflow: "visible",
                  zIndex: 9999,
                },
                "& .MuiMenu-paper": {
                  overflow: "visible",
                  zIndex: 9999,
                },
                "& .MuiMenu-list": {
                  overflow: "visible",
                  paddingTop: 0,
                  paddingBottom: 0,
                },
                "& .MuiPopover-root": {
                  zIndex: 9999,
                },
                ".react-select__menu": {
                  position: "absolute",
                  zIndex: 9999,
                  overflow: "visible",
                },
              }}
            />
          </Box>
        )}
      </AppDialogContent>
      <AppDialogFooter>
        <DialogActions>
          <AppButton variant="outlined" onClick={onClose} disabled={isLoading}>
            Cancel
          </AppButton>
          <AppButton
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={isLoading}
          >
            Save
          </AppButton>
        </DialogActions>
      </AppDialogFooter>
    </AppDialog>
  );
};
