import { Theme, Typography } from "@mui/material";
import { config } from "JS/Config";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

const styles = (props: any, theme: Theme) => {
  return {
    root: css({
      position: "fixed",
      bottom: theme.spacing(0),
      width: theme.drawer.width,
    }),
    wrapper: css({
      textAlign: "center",
    }),
    icon: css({
      display: "inline-block",
      width: "auto",
      objectPosition: "center",
      height: theme.header.height,
      objectFit: "contain",
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export type DrawerBottomViewClassKey = StyleClassKey<typeof useStyles>;

export interface DrawerBottomViewProps
  extends StandardProps<{}, DrawerBottomViewClassKey> {
  onClick: () => void;
}

export function DrawerBottomView(props: DrawerBottomViewProps) {
  const classes = useStyles(props);
  const { onClick } = props;

  return (
    <div className={classes.root}>
      <Typography
        align={"center"}
        style={{ width: "100%", display: "block" }}
        variant={"caption"}
      >
        Software Version {config.versions.appVersion}
      </Typography>
    </div>
  );
}

export default DrawerBottomView;
