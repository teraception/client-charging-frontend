import { DialogContent, DialogContentProps, Theme } from "@mui/material";
import React from "react";
import clsx from "clsx";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

const styles = (props: any, theme: Theme) => {
  return {
    root: css({ padding: theme.spacing(1), paddingTop: "10px !important" }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);
type AppDialogContentClassKey = StyleClassKey<typeof useStyles>;
export interface AppDialogContentProps
  extends StandardProps<DialogContentProps, AppDialogContentClassKey> {}
export const AppDialogContent: React.FC<AppDialogContentProps> = (props) => {
  const classes = useStyles(props);
  const { className, ...rest } = props;

  return <DialogContent {...rest} className={clsx(className, classes.root)} />;
};

export default AppDialogContent;
