import { DialogTitle, Theme } from "@mui/material";
import React from "react";
import { DialogTitleProps } from "@mui/material";
import clsx from "clsx";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

const styles = (props: any, theme: Theme) => {
  return {
    root: css({
      color: theme.palette.primary.main,
      marginTop: theme.spacing(1),
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

type AppDialogTitleClassKey = StyleClassKey<typeof useStyles>;
export interface AppDialogTitleProps
  extends StandardProps<DialogTitleProps, AppDialogTitleClassKey> {}
export const AppDialogTitle: React.FC<AppDialogTitleProps> = (props) => {
  const classes = useStyles(props);
  const { className, ...rest } = props;

  return <DialogTitle {...rest} className={clsx(className, classes.root)} />;
};

export default AppDialogTitle;
