import AppButton from "./AppButton";
import clsx from "clsx";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import { ButtonProps, Theme } from "@mui/material";

import { StandardProps } from "JS/React/Types/Style";

const styles = (props: any, theme: Theme) => {
  return {
    roundedButton: css({
      padding: theme.spacing(1, 2.5),
      textTransform: "uppercase",
      color: theme.palette.common.white,
      backgroundColor: theme.palette.primary.main,
      borderRadius: "5px",
      fontSize: theme.spacing(1.2),
    }),
    whiteButton: css({
      backgroundColor: `${theme.palette.common.white} !important`,
      color: `${theme.palette.secondary.main} !important`,
      border: `1px solid ${theme.colors.pastelGrey}`,
      "&:hover,&:focus": css({
        backgroundColor: theme.colors.mercury,
        border: `1px solid ${theme.colors.silverChalice}`,
        color: theme.palette.secondary.dark,
      }),
    }),
    gradientButton: css({
      background: `${theme.palette.primary.main} !important`,
    }),
    greenButton: css({
      backgroundColor: theme.colors.green,
      "&:hover,&:focus": css({
        backgroundColor: theme.colors.green,
      }),
    }),
    grayButton: css({
      backgroundColor: `${theme.palette.grey["200"]} !important`,
      "&:hover,&:focus": css({
        backgroundColor: theme.palette.grey["200"],
      }),
    }),
    redButton: css({
      backgroundColor: theme.colors.red,
      "&:hover,&:focus": css({
        backgroundColor: theme.colors.red,
      }),
    }),
    smallPadding: css({
      padding: theme.spacing(0.7, 1.5),
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export type CustomButtonClassKey = StyleClassKey<typeof useStyles>;
export interface CustomButtonProps
  extends StandardProps<ButtonProps, CustomButtonClassKey> {
  buttonVariant?: "gradient" | "white" | "green" | "gray" | "red";
  padding?: "small" | "normal";
}

function Component(props: CustomButtonProps) {
  const styleClasses = useStyles(props);
  const { className, classes, padding, buttonVariant, ...rest } = props;

  return (
    <AppButton
      {...rest}
      className={clsx(
        classes.roundedButton,
        className,
        {
          [classes.gradientButton]: buttonVariant === "gradient",
        },
        {
          [classes.whiteButton]: buttonVariant === "white",
        },
        {
          [classes.greenButton]: buttonVariant === "green",
        },
        {
          [classes.grayButton]: buttonVariant === "gray",
        },
        {
          [classes.redButton]: buttonVariant === "red",
        },
        {
          [classes.smallPadding]: padding === "small",
        }
      )}
    />
  );
}

Component.displayName = "CustomButton";
Component.defaultProps = {
  buttonVariant: "gradient",
} as CustomButtonProps;

export const CustomButton = Component;
export default CustomButton;
