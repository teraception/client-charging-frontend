import React, { ReactNode, useState } from "react";
import {
  DialogActions,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Theme,
  Typography,
} from "@mui/material";
import clsx from "clsx";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

import AppTextButton from "./AppTextButton";

const styles = (props: any, theme: Theme) => {
  return {
    root: css({
      "& .MuiDialog-paper": css({
        width: "300px",
      }),
      zIndex: "1320!important" as any,
    }),
    title: css({
      "& h2": css({
        fontWeight: "bolder",
      }),
    }),
    content: css({
      color: theme.palette.grey["700"],
      fontWeight: 500,
    }),
    warning: css({
      marginTop: theme.spacing(2),
      fontWeight: "bold",
    }),
    red: css({
      color: `${theme.colors.red} !important`,
    }),
    black: css({
      color: `${theme.palette.common.black} !important`,
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export type RenderWithConfirmationClassKey = StyleClassKey<typeof useStyles>;

interface State {
  modelOpen: boolean;
  confirmationData?: any;
}

interface RenderProps {
  askConfirmation: (data?: any) => void;
}

export interface RenderWithConfirmationProps
  extends StandardProps<{}, RenderWithConfirmationClassKey> {
  dialogTitle: string;
  dialogMessage: string;
  permanent: boolean;
  dialogActions?: (dismiss: () => void, confirm: () => void) => ReactNode;
  onConfirm: (data?: any) => void;
  children: (renderProps: RenderProps) => ReactNode;
}

export function Component(props: RenderWithConfirmationProps) {
  const classes = useStyles(props);
  const [state, setState] = useState({
    modelOpen: false,
    confirmationData: null,
  } as State);

  const {
    dialogTitle,
    dialogMessage,
    dialogActions,
    onConfirm,
    permanent,
    children,
  } = props;

  const dismiss = () => setState({ ...state, modelOpen: false });

  const confirm = () => {
    onConfirm(state.confirmationData);
    dismiss();
  };

  const dialog = state.modelOpen && (
    <Dialog
      onClick={(e) => e.stopPropagation()}
      open={state.modelOpen}
      onClose={(_, reason) => reason !== "backdropClick" && dismiss()}
      BackdropProps={{ style: { backgroundColor: "transparent" } }}
      disableEscapeKeyDown={true}
      disableEnforceFocus={true}
      disableScrollLock={true}
      className={classes.root}
    >
      <DialogTitle className={classes.title}>{dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText
          id="alert-dialog-description"
          className={classes.content}
        >
          {dialogMessage}
        </DialogContentText>
        {permanent && (
          <Typography
            variant="body1"
            className={clsx(classes.red, classes.warning)}
          >
            Warning! This action cannot be undone!
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        {dialogActions ? (
          dialogActions(dismiss, confirm)
        ) : (
          <React.Fragment>
            <AppTextButton onClick={confirm} className={classes.red}>
              Confirm
            </AppTextButton>
            <AppTextButton onClick={dismiss} className={classes.black}>
              Cancel
            </AppTextButton>
          </React.Fragment>
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <React.Fragment>
      {dialog}
      {children({
        askConfirmation: (data: any) =>
          setState({
            modelOpen: true,
            confirmationData: data,
          }),
      })}
    </React.Fragment>
  );
}

Component.displayName = "RenderWithConfirmation";
Component.defaultProps = {
  onConfirm: () => {},
  permanent: true,
  children: (renderProps: RenderProps) => null,
} as RenderWithConfirmationProps;

export const RenderWithConfirmation = Component;
export default RenderWithConfirmation;
