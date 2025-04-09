import { Button, ButtonProps, Theme } from "@mui/material";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import clsx from "clsx";

const styles = (props: any, theme: Theme) => {
  return {
    empMain: css({
      background: `${theme.palette.primary.main} !important`,
      color: theme.colors.white,
      border: `1px solid transparent`,
      "&:hover": css({
        background: theme.palette.primary.dark,
        filter: "brightness(90%)",
      }),
    }),
    empLight: css({
      background: `${theme.colors.white} !important`,
      color: theme.colors.dune,
      borderColor: theme.colors.pastelGrey,
      "&:hover": css({
        borderColor: theme.colors.silverChalice,
        background: theme.colors.mercury,
        color: theme.colors.jungleGreen,
      }),
    }),
    empText: css({
      background: "transparent !important",
      color: `${theme.palette.primary.main} !important`,
      borderColor: "none",
      "&:hover": css({
        borderColor: theme.colors.silverChalice,
        background: theme.colors.mercury,
        color: theme.colors.jungleGreen,
      }),
    }),
    empCancel: css({
      background: `${theme.colors.mountainMist} !important`,
      color: theme.colors.white,
      border: `1px solid transparent`,
      "&:hover": css({
        background: theme.colors.smokeyGrey,
        filter: "brightness(90%)",
      }),
    }),
  };
};

export type AppButtonClassKey = StyleClassKey<typeof useStyles>;

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export interface AppButtonProps
  extends StandardProps<ButtonProps, AppButtonClassKey> {
  buttonVariant?: "emp-main" | "emp-light" | "emp-text" | "emp-cancel";
}

function Component(props: AppButtonProps) {
  const classes = useStyles(props);
  const { className, buttonVariant, ...rest } = props;

  return (
    <Button
      {...rest}
      className={clsx(className, {
        [classes.empMain]: buttonVariant === "emp-main",
        [classes.empLight]: buttonVariant === "emp-light",
        [classes.empText]: buttonVariant === "emp-text",
        [classes.empCancel]: buttonVariant === "emp-cancel",
      })}
    />
  );
}

Component.displayName = "AppButton";

Component.defaultProps = {
  color: "primary",
  variant: "contained",
} as AppButtonProps;

export const AppButton = Component;
export default AppButton;
