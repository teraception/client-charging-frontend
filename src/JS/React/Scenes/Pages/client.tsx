import { Box, CircularProgress, Grid, IconButton, Theme } from "@mui/material";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import {
  useDeleteClient,
  useGetAllClients,
  useInviteClient,
  useCreateClient,
  useUpdateClient,
} from "JS/React/Hooks/Clients";
import { StandardProps } from "JS/React/Types/Style";
import { processValidityState } from "JS/types";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import RenderWithConfirmation from "JS/React/Components/RenderWithConfirmation";
import { StatusCode } from "JS/typingForNow/types";
import AppButton from "JS/React/Components/AppButton";
import { InviteClientDialog } from "JS/React/Scenes/Partials/Client/InviteClientDialog";
import { ClientDialog } from "JS/React/Scenes/Partials/Client/ClientDialog";
import { Client } from "JS/typingForNow/types";

export type ClientComponentClassKey = StyleClassKey<typeof useStyles>;

export interface ClientComponentProps
  extends StandardProps<{}, ClientComponentClassKey> {}

const styles = (props: any, theme: Theme) => {
  return {
    root: css({
      padding: theme.spacing(2),
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export const ClientComponent = (props: ClientComponentProps) => {
  const {} = props;
  const classes = useStyles();
  const { getAllClientsResponse, clientsData, getAllClientsLoader } =
    useGetAllClients();
  const { deleteClient, deleteClientLoader, deleteClientResponse } =
    useDeleteClient();
  const { inviteClient, inviteClientLoader, inviteClientResponse } =
    useInviteClient();
  const { createClient, createClientLoader, createClientResponse } =
    useCreateClient();
  const { updateClient, updateClientLoader, updateClientResponse } =
    useUpdateClient();

  const [showInviteDialog, setShowInviteDialog] = useState<boolean>(false);
  const [showClientDialog, setShowClientDialog] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(
    undefined
  );
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    processValidityState(getAllClientsResponse?.validityState);
    processValidityState(deleteClientResponse?.validityState);
    processValidityState(inviteClientResponse?.validityState);
    processValidityState(createClientResponse?.validityState);
    processValidityState(updateClientResponse?.validityState);
  }, [
    getAllClientsResponse,
    deleteClientResponse,
    inviteClientResponse,
    createClientResponse,
    updateClientResponse,
  ]);

  const handleCreateClient = async (data: { name: string }) => {
    try {
      const response = await createClient(data);
      if (response.statusCode === StatusCode.SUCCESS) {
        enqueueSnackbar("Client created successfully", {
          variant: "success",
          autoHideDuration: 3000,
        });
        setShowClientDialog(false);
      }
    } catch (error) {
      console.error("Error creating client:", error);
    }
  };

  const handleUpdateClient = async (data: { name: string }) => {
    if (!selectedClient) return;
    try {
      const response = await updateClient({
        clientId: selectedClient.id,
        data,
      });
      if (response.statusCode === StatusCode.SUCCESS) {
        enqueueSnackbar("Client updated successfully", {
          variant: "success",
          autoHideDuration: 3000,
        });
        setShowClientDialog(false);
        setSelectedClient(undefined);
      }
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setDialogMode("edit");
    setShowClientDialog(true);
  };

  const handleCreateClick = () => {
    setSelectedClient(undefined);
    setDialogMode("create");
    setShowClientDialog(true);
  };

  const clientsTableColumns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableHiding: false,
      },
    ],
    [clientsData]
  );

  const clientsTableRows = useMemo(() => {
    return clientsData?.map((client) => {
      return {
        id: client.id,
        name: client.name,
      };
    });
  }, [clientsData]);

  const clientsTable = useMaterialReactTable({
    columns: clientsTableColumns,
    data: clientsTableRows || [],
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
        <IconButton onClick={() => handleEditClient(row.original)}>
          <EditIcon color="action" />
        </IconButton>
        <RenderWithConfirmation
          onConfirm={async () => {
            const response = await deleteClient(row.original.id);
            if (response.statusCode === StatusCode.SUCCESS) {
              enqueueSnackbar("Client deleted successfully", {
                variant: "success",
                autoHideDuration: 3000,
              });
            }
          }}
          dialogMessage="Are you sure you want to delete this client?"
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

  const handleInviteClient = async (email: string) => {
    try {
      const response = await inviteClient(email);
      if (response.statusCode === StatusCode.SUCCESS) {
        enqueueSnackbar("Client invited successfully", {
          variant: "success",
          autoHideDuration: 3000,
        });
        setShowInviteDialog(false);
      }
    } catch (error) {
      console.error("Error inviting client:", error);
    }
  };

  return (
    <Grid xs={12} container className={classes.root}>
      <Grid container xs={12}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" mb={2} gap={2}>
            <AppButton
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
            >
              Create Client
            </AppButton>
            <AppButton
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={() => setShowInviteDialog(true)}
            >
              Invite Client
            </AppButton>
          </Box>
          <MaterialReactTable table={clientsTable} />
        </Grid>
      </Grid>
      {(getAllClientsLoader ||
        deleteClientLoader ||
        inviteClientLoader ||
        createClientLoader ||
        updateClientLoader) && (
        <CircularProgress
          style={{ position: "fixed", top: "50%", left: "50%" }}
        />
      )}
      <InviteClientDialog
        open={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        onInvite={handleInviteClient}
        loading={inviteClientLoader}
      />
      <ClientDialog
        open={showClientDialog}
        onClose={() => {
          setShowClientDialog(false);
          setSelectedClient(undefined);
        }}
        onSave={
          dialogMode === "create" ? handleCreateClient : handleUpdateClient
        }
        loading={
          dialogMode === "create" ? createClientLoader : updateClientLoader
        }
        client={selectedClient}
        mode={dialogMode}
      />
    </Grid>
  );
};
