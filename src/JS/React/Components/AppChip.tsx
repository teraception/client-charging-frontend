import clsx from "clsx";
import { Chip, ChipProps, Theme } from "@mui/material";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

const styles = (props: any, theme: Theme) => {
  return {
    root: css({
      padding: theme.spacing(0.25, 0.5),
      height: "25px !important",
      borderRadius: "5px !important",
      "& .MuiChip-label": css({
        color: theme.palette.text.primary,
        fontSize: "0.85rem",
      }),
    }),
    primaryFill: css({
      "& .MuiChip-label": css({
        color: `${theme.palette.primary.main} !important`,
        fontSize: "14px",
      }),
    }),
  };
};
export type ChipVariant =
  | "purple-fill"
  | "primary-fill"
  | "danger-fill"
  | "green-fill"
  | "grey-fill";
type AppChipClassKey = StyleClassKey<typeof useStyles>;

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export interface AppChipProps
  extends StandardProps<ChipProps, AppChipClassKey> {
  chipVariant?: ChipVariant;
}

function Component(props: AppChipProps) {
  const { chipVariant } = props;
  const classes = useStyles(props);
  const { className, ...rest } = props;
  const classesToInclude = clsx({
    [classes.primaryFill]: chipVariant === "primary-fill",
  });
  const overriderClasses = {
    root: classesToInclude,
    label: classesToInclude,
  };
  return (
    <Chip
      classes={chipVariant ? overriderClasses : null}
      className={clsx(classes.root, className)}
      {...rest}
    />
  );
}

Component.defaultProps = {} as AppChipProps;
Component.displayName = "AppChip";
export const AppChip = Component;
export default AppChip;
