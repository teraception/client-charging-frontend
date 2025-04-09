import { CircularProgress, Grid, Theme } from "@mui/material";
import { StandardProps } from "JS/React/Types/Style";

import AppDialog from "JS/React/Components/AppDialog";
import AppDialogTitle from "JS/React/Components/AppDialogTitle";
import AppDialogContent from "JS/React/Components/AppDialogContent";
import AppDialogFooter from "JS/React/Components/AppDialogFooter";
import AppButton from "JS/React/Components/AppButton";
import { ValidationRules, Validations } from "JS/helpers";
import { useValidityState } from "JS/React/Hooks/UseValidityState";
import { useGetUserDetails, useUpdateUserRoles } from "JS/React/Hooks/Users";
import { useEffect } from "react";
import { processValidityState } from "JS/types";
import { Role, StatusCode } from "@teraception/employee-management-lib";
import { SelectComponent } from "JS/React/Components/SelectComponent";
import { enqueueSnackbar } from "notistack";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

export type ChangeUserRoleClassKey = StyleClassKey<typeof useStyles>;

export interface ChangeUserRoleDialogProps
  extends StandardProps<{}, ChangeUserRoleClassKey> {
  onClose: () => void;
  updatedUserId: string;
}

const styles = (props: any, theme: Theme) => {
  return {
    overflowRevert: css({
      "& .MuiPaper-root.MuiPaper-elevation": css({
        overflow: "revert",
      }),
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

const validationRules: ValidationRules<
  keyof {
    role: string[];
  }
> = {
  role: [
    {
      rule: Validations.REQUIRED,
      message: "role is required",
    },
  ],
};

const rolesArray: string[] = Object.values(Role);

export const ChangeUserRoleDialog = (props: ChangeUserRoleDialogProps) => {
  const { onClose, updatedUserId } = props;
  const classes = useStyles();
  const { userData, userDetailLoader, userDetailsResponse } =
    useGetUserDetails(updatedUserId);
  const { updateUserRoles, updateUserRolesLoader, updateUserRolesResponse } =
    useUpdateUserRoles();

  const {
    data: formData,
    setData: setFormData,
    getFieldState,
    submitFormIfValid: submitFormWithValidate,
  } = useValidityState<
    {
      role: Role[];
    },
    keyof {
      role: Role[];
    }
  >({ role: userData?.role }, validationRules);

  useEffect(() => {
    setFormData({ role: userData?.role });
  }, [userData]);
  useEffect(() => {
    processValidityState(userDetailsResponse?.validityState);
    processValidityState(updateUserRolesResponse?.validityState);
  }, [userDetailsResponse, updateUserRolesResponse]);

  async function handleFormSubmit() {
    const response = await updateUserRoles({
      userId: updatedUserId,
      role: formData.role,
    });
    if (response.statusCode === StatusCode.SUCCESS) {
      enqueueSnackbar("role updated successfully", {
        variant: "success",
        autoHideDuration: 3000,
      });
      onClose();
    }
  }

  return (
    <Grid container xs={12}>
      <AppDialog
        open={true}
        onClose={onClose}
        className={classes.overflowRevert}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: "500px!important",
          },
        }}
      >
        <AppDialogTitle style={{ padding: "0" }}>
          {"Assign Roles"}
        </AppDialogTitle>
        <AppDialogContent style={{ padding: "0", overflow: "revert" }}>
          <Grid container xs={12}>
            <Grid container xs={12} mb={2} mt={2}>
              <Grid item xs={12}>
                <SelectComponent
                  title="Roles"
                  placeholder="select roles"
                  options={rolesArray?.map((x) => {
                    return {
                      label: x,
                      value: x,
                    };
                  })}
                  onChange={(values) => {
                    setFormData({ role: values });
                  }}
                  selectedValues={formData.role || []}
                  errorInfo={getFieldState("role")}
                />
              </Grid>
            </Grid>
          </Grid>
        </AppDialogContent>
        <AppDialogFooter>
          <AppButton
            // className={classes.btn}
            color="secondary"
            buttonVariant="emp-cancel"
            onClick={onClose}
          >
            Cancel
          </AppButton>
          <AppButton
            // className={classes.btn}
            style={{ marginLeft: "20px" }}
            color="primary"
            buttonVariant="emp-main"
            onClick={() => {
              submitFormWithValidate(handleFormSubmit);
            }}
            // disabled={!isFormValid}
          >
            Save
          </AppButton>
        </AppDialogFooter>
      </AppDialog>
      {(userDetailLoader || updateUserRolesLoader) && (
        <CircularProgress
          style={{ position: "fixed", top: "50%", left: "50%", zIndex: "9999" }}
        />
      )}
    </Grid>
  );
};
