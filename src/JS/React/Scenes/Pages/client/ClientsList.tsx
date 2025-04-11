import { Box, CircularProgress, Grid, IconButton, Theme } from "@mui/material";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import { useGetClientsWithUserId } from "JS/React/Hooks/Clients";
import { StandardProps } from "JS/React/Types/Style";
import { processValidityState } from "JS/types";
import { useEffect, useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useNavigate } from "react-router-dom";
import { routesForContext } from "JS/Routing/Routes";
import { useLoggedInUser } from "JS/Routing/Context/LoggedInUseContextProvider";
import { useRouting } from "JS/React/Hooks/Routes";

export type ClientsListComponentClassKey = StyleClassKey<typeof useStyles>;

export interface ClientsListComponentProps
  extends StandardProps<{}, ClientsListComponentClassKey> {}

const styles = (props: any, theme: Theme) => {
  return {
    root: css({
      padding: theme.spacing(2),
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export const ClientsListComponent = (props: ClientsListComponentProps) => {
  const {} = props;
  const classes = useStyles();
  const { loggedInUser } = useLoggedInUser();
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();
  const navigate = useNavigate();

  const {
    clientsData,
    getClientsWithUserIdLoader,
    getClientsWithUserIdResponse,
  } = useGetClientsWithUserId(loggedInUser?.user?.id);

  useEffect(() => {
    processValidityState(getClientsWithUserIdResponse?.validityState);
  }, [getClientsWithUserIdResponse]);

  const clientsTableColumns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableHiding: false,
      },
    ],
    []
  );

  const clientsTableRows = useMemo(
    () =>
      clientsData?.map((client) => ({
        id: client.id,
        name: client.name,
      })) || [],
    [clientsData]
  );

  const clientsTable = useMaterialReactTable({
    columns: clientsTableColumns,
    data: clientsTableRows,
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
        <IconButton
          onClick={() => {
            navigate(routeProvider.react.addPaymentMethod(row.original.id));
          }}
        >
          <AddIcon color="action" />
        </IconButton>
      </Box>
    ),
  });

  return (
    <Grid xs={12} container className={classes.root}>
      <Grid container xs={12}>
        <Grid item xs={12}>
          <MaterialReactTable table={clientsTable} />
        </Grid>
      </Grid>
      {getClientsWithUserIdLoader && (
        <CircularProgress
          style={{ position: "fixed", top: "50%", left: "50%" }}
        />
      )}
    </Grid>
  );
};
