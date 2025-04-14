import {
  CircularProgress,
  Grid,
  Theme,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import { useGetClientPaymentMethods } from "JS/React/Hooks/PaymentMethods/Hook";
import { StandardProps } from "JS/React/Types/Style";
import { useSelectedClient } from "JS/React/Context/SelectedClientContext";
import { useAccessHandler } from "JS/React/Hooks/AccessHandler";
import { processValidityState } from "JS/types";
import { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router";
import { useRouting } from "JS/React/Hooks/Routes";

const styles = (props: any, theme: Theme) => ({
  root: css({
    // padding: theme.spacing(3),
  }),
});

export type PaymentMethodComponentClassKey = StyleClassKey<typeof styles>;

export interface PaymentMethodComponentProps
  extends StandardProps<{}, PaymentMethodComponentClassKey> {}

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export const PaymentMethodComponent = (props: PaymentMethodComponentProps) => {
  const {} = props;
  const classes = useStyles();
  const { selectedClient } = useSelectedClient();
  const { isSuperAdmin, isClient } = useAccessHandler();
  const navigate = useNavigate();
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();

  // Get client-specific payment methods when a client is selected
  const {
    clientPaymentMethods,
    clientPaymentMethodsIsLoading,
    clientPaymentMethodsResponse,
  } = useGetClientPaymentMethods(selectedClient?.id || null);

  useEffect(() => {
    processValidityState(clientPaymentMethodsResponse?.validityState);
  }, [clientPaymentMethodsResponse]);

  const isLoading = clientPaymentMethodsIsLoading;

  const handleAddPaymentMethod = () => {
    if (selectedClient) {
      navigate(routeProvider.react.addPaymentMethod(selectedClient.id));
    }
  };

  const paymentMethodColumns = useMemo(
    () => [
      {
        accessorKey: "project",
        header: "Project Name",
        enableHiding: false,
        accessorFn: (row: any) => row.dbLinkedProject?.name || "-",
      },
      {
        accessorKey: "brand",
        header: "Card Brand",
        enableHiding: false,
        accessorFn: (row: any) => row.card?.brand || "-",
      },
      {
        accessorKey: "last4",
        header: "Last 4 Digits",
        enableHiding: false,
        accessorFn: (row: any) => row.card?.last4 || "-",
      },
      {
        accessorKey: "expMonth",
        header: "Expiry Month",
        enableHiding: false,
        accessorFn: (row: any) => row.card?.exp_month || "-",
      },
      {
        accessorKey: "expYear",
        header: "Expiry Year",
        enableHiding: false,
        accessorFn: (row: any) => row.card?.exp_year || "-",
      },
    ],
    []
  );

  const paymentMethodTable = useMaterialReactTable({
    columns: paymentMethodColumns,
    data: clientPaymentMethods || [],
    enableFullScreenToggle: false,
    enableColumnOrdering: true,
    enableGlobalFilter: false,
    initialState: { density: "compact" },
    muiPaginationProps: {
      rowsPerPageOptions: [25, 50, 100],
    },
  });

  return (
    <Grid container className={classes.root}>
      <Grid
        item
        container
        mb={3}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h4">Payment Methods</Typography>
        {isClient && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleAddPaymentMethod()}
          >
            Add Payment Method
          </Button>
        )}
      </Grid>
      <Grid container xs={12}>
        <Grid item xs={12}>
          <MaterialReactTable table={paymentMethodTable} />
        </Grid>
      </Grid>
      {isLoading && (
        <CircularProgress
          style={{ position: "fixed", top: "50%", left: "50%" }}
        />
      )}
    </Grid>
  );
};
