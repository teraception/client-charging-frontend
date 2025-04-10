import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Switch,
  Theme,
  Tooltip,
} from "@mui/material";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import {
  useDeleteUser,
  useGetAllUsers,
  useUpdateUserBlockedStatus,
} from "JS/React/Hooks/Users";
import { StandardProps } from "JS/React/Types/Style";

import { processValidityState } from "JS/types";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import DeleteIcon from "@mui/icons-material/Delete";
import LockResetIcon from "@mui/icons-material/LockReset";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { UpdateUserPasswordDialog } from "../Partials/User/UpdatePasswordUserModal";
import { ChangeUserRoleDialog } from "../Partials/User/ChangeUserRoleModal";
import RenderWithConfirmation from "JS/React/Components/RenderWithConfirmation";
import AppChip from "JS/React/Components/AppChip";
import { StatusCode } from "JS/typingForNow/types";
// import { StatusCode } from "@teraception/client-payment-integration-lib";

export type UserComponentClassKey = StyleClassKey<typeof useStyles>;

export interface UserComponentProps
  extends StandardProps<{}, UserComponentClassKey> {}

const styles = (props: any, theme: Theme) => {
  return {
    switchStyle: css({
      "& .MuiSwitch-track": {
        backgroundColor: `${theme.palette.action} !important`,
      },
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);
export const UserComponent = (props: UserComponentProps) => {
  const {} = props;
  const classes = useStyles();
  const { getAllUsersResponse, usersData, getAllUsersLoader } =
    useGetAllUsers();
  const {
    updateUserBlockedStatus,
    updateUserBlockedStatusResponse,
    updateUserBlockedStatusLoader,
  } = useUpdateUserBlockedStatus();
  const { deleteUser, deleteUserLoader, deleteUserResponse } = useDeleteUser();

  const [showUpdatePasswordDialog, setShowUpdatePasswordDialog] =
    useState<boolean>(false);
  const [showChangeUserRoleDialog, setShowChangeUserRoleDialog] =
    useState<boolean>(false);
  const [updateUserId, setUpdateUserId] = useState<string>(null);

  useEffect(() => {
    processValidityState(updateUserBlockedStatusResponse?.validityState);
    processValidityState(getAllUsersResponse?.validityState);
    processValidityState(deleteUserResponse?.validityState);
  }, [
    updateUserBlockedStatusResponse,
    getAllUsersResponse,
    deleteUserResponse,
  ]);

  const usersTableCoulumns = useMemo(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        enableHiding: false,
      },
      {
        accessorKey: "role",
        header: "Role",
        enableHiding: false,
      },
      {
        accessorKey: "status",
        header: "Active Status",
        enableHiding: false,
        Cell: ({ row }) => {
          return (
            <Switch
              checked={!row.original.isBlocked}
              color="primary"
              className={classes.switchStyle}
              onChange={async (e) => {
                try {
                  const response = await updateUserBlockedStatus({
                    userId: row.original.id,
                    blockedStatus: !row.original.isBlocked,
                  });
                  if (response.statusCode === StatusCode.SUCCESS) {
                    enqueueSnackbar("user blocked status updated", {
                      variant: "success",
                      autoHideDuration: 3000,
                    });
                  }
                } catch (error) {
                  console.log(
                    "error while updating user blocked status",
                    error
                  );
                }
              }}
            />
          );
        },
      },
      {
        accessorKey: "utils",
        header: "Utils",
        enableHiding: false,
        Cell: ({ row }) => {
          return (
            <Box>
              <Tooltip title="Change User Role" placement="top">
                <IconButton
                  onClick={() => {
                    setUpdateUserId(row.original.id);
                    setShowChangeUserRoleDialog(true);
                  }}
                >
                  <FingerprintIcon color="action" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Update Password" placement="top">
                <IconButton
                  onClick={() => {
                    setShowUpdatePasswordDialog(true);
                  }}
                >
                  <LockResetIcon color="action" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [usersData]
  );
  const usersTableRows = useMemo(() => {
    return usersData?.map((user) => {
      return {
        id: user.id,
        email: user.email,
        role: user.role.map((x) => (
          <AppChip
            label={x}
            chipVariant="primary-fill"
            style={{ margin: "0 5px 0 5px" }}
          />
        )),
        isBlocked: user.isBlocked,
      };
    });
  }, [usersData]);

  const usersTable = useMaterialReactTable({
    columns: usersTableCoulumns,
    data: usersTableRows || [],
    // enableRowSelection: true,
    enableFullScreenToggle: false,
    enableColumnOrdering: true,
    enableGlobalFilter: false,
    initialState: { density: "compact" },
    muiPaginationProps: {
      rowsPerPageOptions: [25, 50, 100],
    },
    enableRowActions: true,
    positionActionsColumn: "last",
    renderRowActions: ({ row }) => (
      <Box>
        <RenderWithConfirmation
          onConfirm={async () => {
            const response = await deleteUser(row.original.id);
            if (response.statusCode === StatusCode.SUCCESS) {
              enqueueSnackbar("user deleted successfully", {
                variant: "success",
                autoHideDuration: 3000,
              });
            }
          }}
          dialogMessage="Are you sure you want to delete"
        >
          {(props) => (
            <IconButton
              onClick={() => {
                props.askConfirmation();
              }}
            >
              <DeleteIcon color="action" />
            </IconButton>
          )}
        </RenderWithConfirmation>
      </Box>
    ),
  });

  return (
    <Grid xs={12} container>
      <Grid container xs={12}>
        <Grid item xs={12}>
          <MaterialReactTable table={usersTable} />
        </Grid>
      </Grid>
      {(getAllUsersLoader ||
        updateUserBlockedStatusLoader ||
        deleteUserLoader) && (
        <CircularProgress
          style={{ position: "fixed", top: "50%", left: "50%" }}
        />
      )}
      {showUpdatePasswordDialog && (
        <UpdateUserPasswordDialog
          onClose={() => setShowUpdatePasswordDialog(false)}
        />
      )}
      {showChangeUserRoleDialog && (
        <ChangeUserRoleDialog
          onClose={() => {
            setUpdateUserId(null);
            setShowChangeUserRoleDialog(false);
          }}
          updatedUserId={updateUserId}
        />
      )}
    </Grid>
  );
};
