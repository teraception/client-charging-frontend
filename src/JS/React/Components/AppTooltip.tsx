import Tippy, { TippyProps } from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import { Theme } from "@mui/material";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

import { StandardProps } from "JS/React/Types/Style";

const styles = (props: any, theme: Theme) => {
  return {};
};
const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export type AppTooltipClassKey = StyleClassKey<typeof useStyles>;
export interface AppTooltipProps
  extends StandardProps<TippyProps, AppTooltipClassKey> {}

export const AppTooltip = (props: AppTooltipProps) => {
  const { ...rest } = props;
  return <Tippy {...rest}>{props.children}</Tippy>;
};
