import { Grid, Theme, Typography } from "@mui/material";
import { useAuth } from "JS/Cognito/CognitoContextProvider";
import { useRouting } from "JS/React/Hooks/Routes";
import AppButton from "JS/React/Components/AppButton";
import TextFieldWithError from "JS/React/Components/TextFieldWithError";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useNavigate } from "react-router";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

const styles = (props: any, theme: Theme) => ({
  titleStyle: css({
    color: theme.palette.primary.main,
    marginTop: theme.spacing(1),
  }),
});
const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export const ConfirmResettingPasswordDetails = () => {
  const classes = useStyles();
  const { confirmPasswordReset } = useAuth();
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();
  const navigate = useNavigate();
  const [confirmationDetails, setConfirmationDetails] = useState({
    email: "",
    password: "",
    confirmationCode: "",
  });

  return (
    <Grid
      container
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        margin: "0 auto",
        maxWidth: "400px",
        padding: "20px",
        borderRadius: "10px",
        backgroundColor: "white",
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      }}
    >
      <Grid item container>
        <Typography variant="h5" className={classes.titleStyle} mb={3}>
          Confirmation Details
        </Typography>
      </Grid>
      <Grid item container mb={2}>
        <TextFieldWithError
          margin="normal"
          fullWidth
          name="email"
          label="Email"
          type="email"
          id="email"
          onChange={(e) =>
            setConfirmationDetails({
              ...confirmationDetails,
              email: e.target.value,
            })
          }
        />
      </Grid>
      <Grid item container mb={2}>
        <TextFieldWithError
          margin="normal"
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          onChange={(e) =>
            setConfirmationDetails({
              ...confirmationDetails,
              password: e.target.value,
            })
          }
        />
      </Grid>
      <Grid item container mb={2}>
        <TextFieldWithError
          margin="normal"
          fullWidth
          name="confirmationCode"
          label="Confirmation Code"
          type="number"
          id="confirmationCode"
          onChange={(e) =>
            setConfirmationDetails({
              ...confirmationDetails,
              confirmationCode: e.target.value,
            })
          }
        />
      </Grid>
      <Grid item container>
        <AppButton
          buttonVariant="emp-main"
          onClick={async (e) => {
            e.preventDefault();
            try {
              await confirmPasswordReset({
                confirmationCode: confirmationDetails.confirmationCode,
                newPassword: confirmationDetails.password,
                username: confirmationDetails.email,
              });
              enqueueSnackbar("password reset successfully", {
                variant: "success",
                autoHideDuration: 3000,
              });
            } catch (error) {
              enqueueSnackbar(error.message, {
                variant: "error",
                autoHideDuration: 3000,
              });
            } finally {
              navigate(`${routeProvider.react.login()}`);
            }
          }}
        >
          Reset Password
        </AppButton>
      </Grid>
    </Grid>
  );
};
