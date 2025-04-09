import {
  Avatar,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Theme,
  Typography,
} from "@mui/material";
import { Fragment, useState } from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useRouting } from "JS/React/Hooks/Routes";
import { useNavigate } from "react-router-dom";
import { useAuth } from "JS/Cognito/CognitoContextProvider";
import AppButton from "JS/React/Components/AppButton";
import TextFieldWithError from "JS/React/Components/TextFieldWithError";
import { enqueueSnackbar } from "notistack";
import { StandardProps } from "JS/React/Types/Style";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

export type LoginPageClassKey = StyleClassKey<typeof useStyles>;

export interface LoginPageProps extends StandardProps<{}, LoginPageClassKey> {}

const styles = (props: any, theme: Theme) => {
  return {
    titleStyle: css({
      color: theme.palette.primary.main,
      marginTop: theme.spacing(1),
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export const Login = () => {
  const classes = useStyles();
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();
  const navigate = useNavigate();
  const { logIn, loading: loginLoader, resetPass } = useAuth();

  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    await logIn({
      username: loginDetails.email,
      password: loginDetails.password,
      options: {
        authFlowType: "USER_PASSWORD_AUTH",
      },
    });
  };
  return (
    <Fragment>
      <Grid
        component="main"
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
        <Grid container>
          <Grid item container justifyContent={"center"} mb={2}>
            <Avatar>
              <LockOutlinedIcon
                className={classes.titleStyle}
                style={{
                  backgroundColor: "white",
                  width: "100%",
                  height: "100%",
                  padding: 0,
                  margin: 0,
                  // border: "1px solid white",
                }}
              />
            </Avatar>
          </Grid>
          <Grid item container justifyContent={"center"} mb={2}>
            <Typography
              component="h1"
              variant="h5"
              className={classes.titleStyle}
            >
              Login in
            </Typography>
          </Grid>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextFieldWithError
              margin="normal"
              fullWidth
              type="email"
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={(e) =>
                setLoginDetails({ ...loginDetails, email: e.target.value })
              }
            />
            <TextFieldWithError
              margin="normal"
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(e) =>
                setLoginDetails({ ...loginDetails, password: e.target.value })
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
                !loginDetails.email || !loginDetails.password || loginLoader
                  ? true
                  : false
              }
              onClick={(e) => handleSubmit(e)}
            >
              Log In
            </AppButton>
            <Grid container>
              <Grid item xs>
                <AppButton
                  buttonVariant="emp-text"
                  variant="text"
                  style={{ padding: 0 }}
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!loginDetails.email) {
                      alert("please enter email");
                    } else {
                      const response = await resetPass({
                        username: loginDetails.email,
                      });
                      if (
                        response.nextStep.resetPasswordStep ===
                        "CONFIRM_RESET_PASSWORD_WITH_CODE"
                      ) {
                        enqueueSnackbar("Reset Code was sent to your email", {
                          variant: "success",
                          autoHideDuration: 3000,
                        });
                        navigate(
                          `${routeProvider.react.confirmResetPassword()}`
                        );
                      }
                    }
                  }}
                >
                  Forgot password?
                </AppButton>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
      {loginLoader && (
        <CircularProgress
          style={{ position: "fixed", top: "50%", left: "50%" }}
        />
      )}
    </Fragment>
  );
};
