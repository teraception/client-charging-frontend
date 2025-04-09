import { CircularProgress, Grid, Theme } from "@mui/material";
import { StandardProps } from "JS/React/Types/Style";

import AppDialog from "JS/React/Components/AppDialog";
import AppDialogTitle from "JS/React/Components/AppDialogTitle";
import AppDialogContent from "JS/React/Components/AppDialogContent";
import TextFieldWithError from "JS/React/Components/TextFieldWithError";
import AppDialogFooter from "JS/React/Components/AppDialogFooter";
import AppButton from "JS/React/Components/AppButton";
import { ValidationRules, Validations } from "JS/helpers";
import { useValidityState } from "JS/React/Hooks/UseValidityState";
import { useAuth } from "JS/Cognito/CognitoContextProvider";
import { enqueueSnackbar } from "notistack";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

export type UpdateUserPasswordClassKey = StyleClassKey<typeof useStyles>;

export interface UpdateUserPasswordDialogProps
  extends StandardProps<{}, UpdateUserPasswordClassKey> {
  onClose: () => void;
}

const styles = (props: any, theme: Theme) => {
  return {};
};
const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

const validationRules: ValidationRules<
  keyof {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
> = {
  oldPassword: [
    {
      rule: Validations.REQUIRED,
      message: "old password is required",
    },
  ],
  newPassword: [
    {
      rule: Validations.REQUIRED,
      message: "new password is required",
    },
  ],
  confirmPassword: [
    {
      rule: Validations.REQUIRED,
      message: "confirm password is required",
    },
    {
      rule: Validations.CONFIRM,
      options: { confirmValue: "" },
      message: "password does not match",
    },
  ],
};

export const UpdateUserPasswordDialog = (
  props: UpdateUserPasswordDialogProps
) => {
  const { onClose } = props;
  const classes = useStyles();
  const { updatePass, isChangingPassword } = useAuth();

  const {
    data: formData,
    setData: setFormData,
    getFieldState,
  } = useValidityState<
    {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
    keyof {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    }
  >({ oldPassword: "", newPassword: "", confirmPassword: "" }, validationRules);

  function setConfirmPasswordValidationState(confirmValue: string) {
    validationRules.confirmPassword = [
      {
        rule: Validations.REQUIRED,
        message: "confirm password is required",
      },
      {
        rule: Validations.CONFIRM,
        options: { confirmValue },
        message: "password not matched",
      },
    ];
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    try {
      await updatePass({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      onClose();
    }
  }

  return (
    <Grid container xs={12}>
      <AppDialog
        open={true}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: "500px!important",
          },
        }}
      >
        <AppDialogTitle style={{ padding: "0" }}>
          {"Update Password"}
        </AppDialogTitle>
        <AppDialogContent style={{ padding: "0" }}>
          <Grid container xs={12} mt={3}>
            <Grid container xs={12}>
              <Grid item xs={12} mb={4}>
                <TextFieldWithError
                  placeholder="old password"
                  label="Old Password"
                  type="password"
                  fullWidth
                  name="oldPassword"
                  variant="standard"
                  value={formData.oldPassword || ""}
                  onChange={(e) =>
                    setFormData({
                      oldPassword: e.target.value,
                    })
                  }
                  errorInfo={getFieldState("oldPassword")}
                />
              </Grid>
              <Grid item xs={12} mb={4}>
                <TextFieldWithError
                  label="New Password"
                  type="password"
                  fullWidth
                  name="newPassword"
                  placeholder="new password"
                  variant="standard"
                  value={formData.newPassword || ""}
                  onChange={(e) => {
                    setFormData({
                      newPassword: e.target.value,
                    });
                  }}
                  errorInfo={getFieldState("newPassword")}
                />
              </Grid>
              <Grid item xs={12} mb={4}>
                <TextFieldWithError
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  name="confirmPassword"
                  placeholder="confirm password"
                  variant="standard"
                  value={formData.confirmPassword || ""}
                  onChange={(e) => {
                    setFormData({
                      confirmPassword: e.target.value,
                    });
                    setConfirmPasswordValidationState(formData.newPassword);
                  }}
                  errorInfo={getFieldState("confirmPassword")}
                />
              </Grid>
            </Grid>
          </Grid>
        </AppDialogContent>
        <AppDialogFooter>
          <AppButton
            // className={classes.btn}
            buttonVariant="emp-cancel"
            color="secondary"
            onClick={onClose}
          >
            Cancel
          </AppButton>
          <AppButton
            // className={classes.btn}
            style={{ marginLeft: "20px" }}
            color="primary"
            buttonVariant="emp-main"
            onClick={(e) => {
              handleFormSubmit(e);
            }}
            // disabled={!isFormValid}
          >
            Save
          </AppButton>
        </AppDialogFooter>
      </AppDialog>
      {isChangingPassword && (
        <CircularProgress
          style={{ position: "fixed", top: "50%", left: "50%", zIndex: "9999" }}
        />
      )}
    </Grid>
  );
};
