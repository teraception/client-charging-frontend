import {
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useGetClientPaymentMethods } from "JS/React/Hooks/PaymentMethods/Hook";
import { useParams } from "react-router-dom";
import { StripePaymentMethod } from "JS/typingForNow/types";
import { useAppServiceContext } from "JS/Routing/Context/ServiceContextProvider";
import { useSelectedClient } from "JS/React/Context/SelectedClientContext";

export const PaymentMethodComponent = () => {
  const { selectedClient } = useSelectedClient();
  const { clientPaymentMethods, clientPaymentMethodsIsLoading } =
    useGetClientPaymentMethods(selectedClient?.id || null);

  return (
    <Grid container direction={"column"} spacing={2}>
      <Grid item>
        <Typography variant="h4">Payment Methods</Typography>
      </Grid>
      <Grid item>
        {clientPaymentMethodsIsLoading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Card Brand</TableCell>
                  <TableCell>Last 4 Digits</TableCell>
                  <TableCell>Expiry Month</TableCell>
                  <TableCell>Expiry Year</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientPaymentMethods.length > 0 ? (
                  clientPaymentMethods.map((method: StripePaymentMethod) => (
                    <TableRow key={method.id}>
                      <TableCell>{method.card?.brand || "N/A"}</TableCell>
                      <TableCell>{method.card?.last4 || "N/A"}</TableCell>
                      <TableCell>{method.card?.exp_month || "N/A"}</TableCell>
                      <TableCell>{method.card?.exp_year || "N/A"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No payment methods found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Grid>
    </Grid>
  );
};
