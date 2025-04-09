import { Grid, Theme, Typography } from "@mui/material";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

const styles = (props: any, theme: Theme) => {
  return {
    root: css({
      height: theme.header.height,
      background: theme.colors.darkGrey,
    }),
    wrapper: css({
      padding: "20px 20px 20px 200px",
    }),
    icon: css({
      display: "inline-block",
      width: theme.drawer.logoSize,
      height: "auto",
      objectFit: "contain",
    }),
    title: css({
      display: "inline-block",
      fontWeight: 900,
      fontSize: theme.drawer.titleFontSize,
      color: theme.palette.common.white,
      verticalAlign: "top",
      paddingTop: theme.spacing(0.5),
      marginLeft: theme.spacing(1),
    }),
  };
};
const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export type DrawerTopViewClassKey = StyleClassKey<typeof useStyles>;

export interface DrawerTopViewProps
  extends StandardProps<{}, DrawerTopViewClassKey> {
  onClick: () => void;
}

export function DrawerTopView(props: DrawerTopViewProps) {
  const classes = useStyles(props);

  return (
    <Grid
      container
      xs={12}
      mt={2}
      justifyContent={"center"}
      alignItems={"center"}
      mb={4}
    >
      <Grid item xs={12} pl={2} pr={2}>
        <Typography variant="h5">Employee Management</Typography>
      </Grid>
    </Grid>
  );
}

export default DrawerTopView;
