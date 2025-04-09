import { Theme, TextField, TextFieldProps } from "@mui/material";
import clsx from "clsx";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

const styles = (props: any, theme: Theme) => {
  return {
    root: css({
      "& .MuiInputBase-input": css({
        padding: theme.spacing(0.5, 1),
        fontSize: "0.9rem",
      }),
      "& .MuiOutlinedInput-root": css({
        minHeight: "30px !important",
        "& .MuiOutlinedInput-notchedOutline": css({
          borderColor: theme.palette.primary.main,
          "&:hover, &:focus": css({
            borderColor: theme.palette.primary.dark,
          }),
          "& legend": css({
            width: "0px !important",
          }),
        }),
        "&.Mui-error .MuiOutlinedInput-notchedOutline": css({
          borderColor: "red",
        }),
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": css({
          borderWidth: "1.5px !important",
        }),
      }),
      "& .MuiFormHelperText-contained": css({
        margin: theme.spacing(0.75, 0.25, 0),
      }),
      "& .MuiInputLabel-outlined": css({
        transform: `translate(14px, 12px) scale(1)`,
        "&.MuiInputLabel-shrink": css({
          transform: `translate(2px, -18px) scale(0.75) !important`,
        }),
      }),
      "& label": css({
        color: theme.palette.grey["500"],
        fontWeight: 500,
        "&.Mui-focused": css({
          color: theme.palette.primary.main,
        }),
        "&.Mui-error": css({
          color: "red !important",
        }),
      }),
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export type AppTextFieldClassKey = StyleClassKey<typeof useStyles>;
export type AppTextFieldProps = TextFieldProps;

export function AppTextField({ className, ...rest }: AppTextFieldProps) {
  const classes = useStyles(rest);
  return (
    <TextField
      className={clsx(className, classes.root)}
      InputLabelProps={{ shrink: true }}
      {...rest}
      color={"primary"}
      variant={"outlined"}
    />
  );
}

export default AppTextField;
