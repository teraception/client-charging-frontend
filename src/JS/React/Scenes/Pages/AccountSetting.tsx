import AppButton from "JS/React/Components/AppButton";
import React, { useEffect } from "react";
import { Grid, Paper, Theme, Typography } from "@mui/material";
import { SelectComponent } from "JS/React/Components/SelectComponent";
import { useValidityState } from "JS/React/Hooks/UseValidityState";
import { useParams } from "react-router";
import { useAllGroups } from "JS/React/Hooks/Groups";
import {
  useLocationDetails,
  useUpdateLocation,
} from "JS/React/Hooks/Locations";
import { ValidationRules, Validations } from "JS/helpers";
import { Location, StatusCode } from "@teraception/employee-management-lib";
import TextFieldWithError from "JS/React/Components/TextFieldWithError";
import { enqueueSnackbar } from "notistack";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import clsx from "clsx";
import { StandardProps } from "JS/React/Types/Style";

const validationRules: ValidationRules<keyof Partial<Location>> = {
  name: [
    {
      rule: Validations.REQUIRED,
      message: "Please enter a name",
    },
  ],
  feedbackNotificationRecipients: [
    {
      rule: Validations.REQUIRED,
      message: "Please select groups for feedback notifications",
    },
  ],
  incrementNotificationRecipients: [
    {
      rule: Validations.REQUIRED,
      message: "Please select groups for increment notifications",
    },
  ],
  leaveNotificationRecipients: [
    {
      rule: Validations.REQUIRED,
      message: "Please select groups for leave notifications",
    },
  ],
};

const styles = (props: any, theme: Theme) => {
  return {
    titleStyle: css({
      color: theme.palette.primary.main,
      padding: theme.spacing(0.5, 0, 2, 0),
    }),
    paperStyle: css({
      padding: "20px",
      width: "100%",
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export type AccountSettingClassKey = StyleClassKey<typeof useStyles>;

export interface AccountSettingProps
  extends StandardProps<{}, AccountSettingClassKey> {}

function AccountSetting(props: AccountSettingProps) {
  const classes = useStyles(props);

  const { groups: groupsData } = useAllGroups();
  const { organizationId, locationId } = useParams();
  const { locationDetails } = useLocationDetails(locationId);
  const { updateLocation } = useUpdateLocation();
  const {
    data: formData,
    setData: setFormData,
    setServerValidityState,
    getFieldState,
    submitFormIfValid: submitFormWithValidate,
  } = useValidityState<Partial<Location>, keyof Partial<Location>>(
    {
      id: "",
      name: "",
      feedbackNotificationRecipients: [],
      incrementNotificationRecipients: [],
      leaveNotificationRecipients: [],
      contactInfo: null,
      organizationId: organizationId,
    },
    validationRules
  );

  useEffect(() => {
    if (locationDetails) {
      setFormData(locationDetails);
    }
  }, [locationDetails]);
  async function handleFormSubmit(data: Partial<Location>) {
    if (data) {
      const response = await updateLocation(data);
      if (response.statusCode === StatusCode.SUCCESS) {
        enqueueSnackbar("location updated successfully", {
          variant: "success",
          autoHideDuration: 3000,
        });
      } else {
        setServerValidityState(response.validityState);
      }
    }
  }

  return (
    <React.Fragment>
      <Paper className={clsx(classes.paperStyle)}>
        <Typography variant="h5" mb={2} className={classes.titleStyle}>
          Manage Location
        </Typography>
        <Grid container xs={12} spacing={2} mt={3} mb={3}>
          <Grid item xs={12} mb={2}>
            <TextFieldWithError
              placeholder="Name"
              label="Name"
              fullWidth
              variant="standard"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({
                  name: e.target.value,
                })
              }
              errorInfo={getFieldState("name")}
            />
          </Grid>
          <Grid item xs={6}>
            <SelectComponent
              title="Feedback Notification Groups"
              isMulti={true}
              placeholder="Feedback Groups"
              options={(groupsData || []).map((x) => {
                return {
                  label: x.name,
                  value: x.id,
                };
              })}
              onChange={(values) => {
                setFormData({
                  feedbackNotificationRecipients: values,
                });
              }}
              selectedValues={formData.feedbackNotificationRecipients}
              errorInfo={getFieldState("feedbackNotificationRecipients")}
            />
          </Grid>
          <Grid item xs={6}>
            <SelectComponent
              title="Increment Notification Groups"
              isMulti={true}
              placeholder="Increment Groups"
              options={(groupsData || []).map((x) => {
                return {
                  label: x.name,
                  value: x.id,
                };
              })}
              onChange={(values) => {
                setFormData({
                  incrementNotificationRecipients: values,
                });
              }}
              selectedValues={formData.incrementNotificationRecipients}
              errorInfo={getFieldState("incrementNotificationRecipients")}
            />
          </Grid>
          <Grid item xs={6}>
            <SelectComponent
              title="Leave Notification Groups"
              isMulti={true}
              placeholder="Leave Groups"
              options={(groupsData || []).map((x) => {
                return {
                  label: x.name,
                  value: x.id,
                };
              })}
              onChange={(values) => {
                setFormData({
                  leaveNotificationRecipients: values,
                });
              }}
              selectedValues={formData.leaveNotificationRecipients}
              errorInfo={getFieldState("leaveNotificationRecipients")}
            />
          </Grid>
        </Grid>

        <Grid container xs={12} justifyContent={"start"} alignItems={"center"}>
          <AppButton
            color="primary"
            buttonVariant="emp-main"
            onClick={() => {
              submitFormWithValidate(handleFormSubmit);
            }}
          >
            Update
          </AppButton>
        </Grid>
      </Paper>
    </React.Fragment>
  );
}

export default AccountSetting;
