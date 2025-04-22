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
  Chip,
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
import { Project } from "JS/typingForNow/types";
import AppChip from "JS/React/Components/AppChip";
import { getPaymentMethodDisplay } from "JS/typingForNow/PaymentMethod";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AppleIcon from "@mui/icons-material/Apple";
import AndroidIcon from "@mui/icons-material/Android";
import LinkIcon from "@mui/icons-material/Link";

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

  // Helper function to get the appropriate icon based on the iconType
  const getIconForPaymentMethod = (iconType: string) => {
    switch (iconType) {
      case "card":
        return <CreditCardIcon />;
      case "bank":
        return <AccountBalanceWalletIcon />;
      case "wallet":
        return <AccountBalanceWalletIcon />;
      case "apple":
        return <AppleIcon />;
      case "google":
        return <AndroidIcon />;
      case "link":
        return <LinkIcon />;
      default:
        return <CreditCardIcon />;
    }
  };

  const paymentMethodColumns = useMemo(
    () => [
      {
        accessorKey: "project",
        header: "Project Names",
        enableHiding: false,
        accessorFn: (row: any) =>
          row.dbLinkedProjects
            .map((project: Project) => project.name)
            .join(", "),
        Cell: ({ row }: any) => (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {row.original.dbLinkedProjects.map((project: Project) => (
              <AppChip
                key={project.id}
                label={project.name}
                chipVariant="primary-fill"
                style={{ margin: "0 5px 0 5px" }}
              />
            ))}
          </Box>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment Method",
        enableHiding: false,
        accessorFn: (row: any) => {
          const { label } = getPaymentMethodDisplay(row);
          return label;
        },
        Cell: ({ row }: any) => {
          const paymentMethod = row.original;
          const { label, color, iconType } =
            getPaymentMethodDisplay(paymentMethod);
          const icon = getIconForPaymentMethod(iconType);

          return (
            <Chip
              icon={icon}
              label={label}
              color={color}
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          );
        },
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
