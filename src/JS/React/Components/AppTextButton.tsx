import { ButtonProps, Theme } from "@mui/material";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import clsx from "clsx";
import { StandardProps } from "JS/React/Types/Style";
import AppButton from "./AppButton";

const styles = (props: any, theme: Theme) => {
  return {
    textButton: css({
      padding: theme.spacing(0.5, 1),
      fontWeight: "bold",
      textTransform: "uppercase",
    }),
  };
};
const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export type AppTextButtonClassKey = StyleClassKey<typeof useStyles>;
export interface AppTextButtonProps
  extends StandardProps<ButtonProps, AppTextButtonClassKey> {
  simple?: boolean;
}

export function AppTextButton(props: AppTextButtonProps) {
  const customClasses = useStyles();
  const { className, classes, simple = false, ...rest } = props;

  return (
    <AppButton
      variant="text"
      {...rest}
      className={clsx(className, {
        [customClasses.textButton]: !simple,
      })}
    />
  );
}

export default AppTextButton;
