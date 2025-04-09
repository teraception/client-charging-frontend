import clsx from "clsx";
import { Dialog, DialogProps, Theme } from "@mui/material";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

const styles = (props: any, theme: Theme) => {
  return {
    dialogShift: css({
      [theme.breakpoints.up("md")]: css({
        marginLeft: theme.drawer.width,
      }),
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    dialogRoot: css({
      padding: theme.spacing(1.5),
      "& .MuiDialog-paperScrollPaper": css({
        borderRadius: 0,
        width: "90vw",
        maxWidth: "90vw",
        [theme.breakpoints.up("md")]: css({
          width: "65vw",
        }),
        [theme.breakpoints.between("sm", "xs")]: css({
          width: "80vw",
        }),

        [theme.breakpoints.up("sm")]: css({
          padding: theme.spacing(3),
        }),
        left: theme.spacing(1),
        padding: theme.spacing(1),
      }),
    }),
    paper: css({
      maxWidth: "95vw",
      overflowY: "visible",
      marginTop: theme.spacing(3) + parseInt(theme.header.height.toString()),
    }),
    scrollBody: css({
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

type AppDialogClassKey = StyleClassKey<typeof useStyles>;

export interface AppDialogProps
  extends StandardProps<DialogProps, AppDialogClassKey> {}

export function AppDialog(props: AppDialogProps) {
  const classes = useStyles(props);
  const { className, ...rest } = props;

  return (
    <Dialog
      {...rest}
      className={clsx(
        className,
        classes.dialogRoot,
        classes.paper,
        classes.scrollBody
      )}
    />
  );
}

export default AppDialog;
