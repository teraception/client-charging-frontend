import {
  Avatar,
  Box,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Theme,
  Typography,
} from "@mui/material";
import { Fragment, useState } from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useRouting } from "JS/React/Hooks/Routes";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { useAuth } from "JS/Cognito/CognitoContextProvider";

import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import TextFieldWithError from "JS/React/Components/TextFieldWithError";
import AppButton from "JS/React/Components/AppButton";

export type PasswordChallengeComponentClassKey = StyleClassKey<
  typeof useStyles
>;

export interface PasswordChallengeComponentProps
  extends StandardProps<{}, PasswordChallengeComponentClassKey> {}

const styles = (props: any, theme: Theme) => {
  return {};
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);
export const PasswordChallengeComponent = (
  props: PasswordChallengeComponentProps
) => {
  const { confirmLogin, isChangingPassword } = useAuth();
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();
  const navigate = useNavigate();

  const [resetPasswordState, setPasswordChallengeState] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      if (
        resetPasswordState.newPassword === resetPasswordState.confirmPassword
      ) {
        const response = await confirmLogin({
          challengeResponse: resetPasswordState.newPassword,
        });
        if (response.isSignedIn && response.nextStep.signInStep === "DONE") {
          navigate(`${routeProvider.react.login()}`);
          window.location.reload();
          enqueueSnackbar("challenges completed successfully", {
            variant: "success",
            autoHideDuration: 3000,
          });
        }
      } else {
        enqueueSnackbar("password doesn't matched", {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  return (
    <Fragment>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Update Password
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextFieldWithError
              margin="normal"
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              id="newpassword"
              autoFocus
              onChange={(e) => {
                setPasswordChallengeState({
                  ...resetPasswordState,
                  newPassword: e.target.value,
                });
              }}
            />
            <TextFieldWithError
              margin="normal"
              fullWidth
              type="password"
              id="confirmpassword"
              label="Confirm Password"
              name="confirmPassword"
              onChange={(e) =>
                setPasswordChallengeState({
                  ...resetPasswordState,
                  confirmPassword: e.target.value,
                })
              }
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <AppButton
              type="submit"
              fullWidth
              buttonVariant="emp-main"
              sx={{ mt: 3, mb: 2 }}
              disabled={
                !resetPasswordState.confirmPassword ||
                !resetPasswordState.newPassword
                  ? true
                  : false
              }
              onClick={(e) => handleSubmit(e)}
            >
              Reset
            </AppButton>
          </Box>
        </Box>
      </Container>
      {isChangingPassword && (
        <CircularProgress
          style={{ position: "fixed", top: "50%", left: "50%" }}
        />
      )}
    </Fragment>
  );
};
