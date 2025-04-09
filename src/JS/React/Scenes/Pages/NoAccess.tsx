import { Theme } from "@mui/material";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import { StandardProps } from "JS/React/Types/Style";

export type NoAccessClassKey = StyleClassKey<typeof useStyles>;

export interface NoAccessComponentProps
  extends StandardProps<{}, NoAccessClassKey> {}

const styles = (props: any, theme: Theme) => {
  return {};
};
const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export const NoAccessComponent = (props: NoAccessComponentProps) => {
  const {} = props;
  const classes = useStyles();
  return <div>You Don't Have Access To This Route</div>;
};
