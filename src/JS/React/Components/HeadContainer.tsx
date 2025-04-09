import { ReactNode, useState } from "react";
import { AppBar, IconButton, Theme, Toolbar } from "@mui/material";
import clsx from "clsx";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

const styles = (props: any, theme: Theme) => {
  return {
    menuButton: css({
      "& svg": css({
        fontSize: "1.2rem",
        fontWeight: "lighter",
      }),
      [theme.breakpoints.down(theme?.drawer.breakpoint)]: css({
        display: "inline",
      }),
    }),
    appBarShift: css({
      width: "100vw",
      [theme.breakpoints.up(theme.drawer.breakpoint)]: css({
        marginLeft: theme.drawer.width,
        width: `calc(100% - ${theme.drawer.width} + 1px)`,
      }),
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    root: css({
      zIndex: theme.zIndex.drawer + 1,
      height: theme.header.height,
      minHeight: theme.header.height,
      flexGrow: 1,
      position: "fixed" as const,
      background: `${theme.header.background} !important`,
      alignItems: "stretch",
      color: `${theme.header.color} !important`,
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      display: "flex",
      "& .MuiToolbar-root": css({
        minHeight: "inherit",
        "& div": css({
          maxHeight: "100%",
        }),
      }),
      "& .MuiAppBar-positionFixed": css({
        left: 0,
      }),
    }),
    headerTitle: css({
      display: "inline-block",
      flexGrow: 1,
      fontSize: theme.header.titleFontSize,
      color: theme.header.color,
      fontWeight: 500,
      [theme.breakpoints.up("sm")]: css({
        marginLeft: theme.spacing(2),
      }),
      [theme.breakpoints.down("xs")]: css({
        fontSize: "0.9rem",
      }),
    }),
    rightSection: css({
      display: "flex",
      alignItems: "center",
      "&>*": css({
        color: theme.header.color,
      }),
    }),
    leftSection: css({
      display: "flex",
      alignItems: "center",
      flexGrow: 1,
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export type HeaderContainerClassKey = StyleClassKey<typeof useStyles>;
export interface HeaderProps
  extends StandardProps<{}, HeaderContainerClassKey> {
  children?: ReactNode;
}

export function HeaderContainer(props: HeaderProps) {
  const [sidebarState, setSidebarOpened] = useState(true);
  const classes = useStyles(props);

  return (
    <AppBar
      position="fixed"
      className={clsx(props.className, classes.root, {
        [classes.appBarShift]: sidebarState,
      })}
      style={{
        flexDirection: "column",
      }}
    >
      <Toolbar
        style={{
          flexGrow: 1,
        }}
      >
        <div className={classes.leftSection}>
          <IconButton
            onClick={() => setSidebarOpened(!sidebarState)}
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
          >
            {/* <FontAwesomeIcon icon={["far", "bars"]} /> */}
          </IconButton>
          {/* <Typography className={classes.headerTitle} variant="h5">
            Smarthub
          </Typography> */}
        </div>
        <div className={classes.rightSection}>{props.children}</div>
      </Toolbar>
    </AppBar>
  );
}

export default HeaderContainer;
