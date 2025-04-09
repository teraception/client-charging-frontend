import React, { useState } from "react";
import clsx from "clsx";
import { Drawer, DrawerProps, Hidden, HiddenProps, Theme } from "@mui/material";
import DrawerTopView from "./DrawerTopView";
import DrawerBottomView from "./DrawerBottomView";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

const styles = (props: any, theme: Theme) => {
  return {
    drawerPaper: css({
      flexGrow: 1,
      flexShrink: 0,
      overflowY: "auto",
      height: "100%",
      boxShadow: `0.5px 0.5px 15px rgba(0,0,0,0.1)`,
      zIndex: 1201,
      background: "transparent",
      minHeight: "100vh",
      width: theme.drawer.width,
      marginRight: theme.spacing(-0.25),
      "& ul": css({
        padding: 0,
        maxHeight: `calc(100vh - 2*${theme.header.height})`,
        overflowY: "auto",
        paddingBottom: theme.spacing(5.5),
        "& ul": css({
          paddingTop: "0px !important",
          paddingRight: "0px !important",
          paddingBottom: 0,
        }),
      }),
      "& .MuiSvgIcon-root": css({
        color: theme.drawer.activeItemColor,
        fontSize: "1rem",
        marginRight: "10px",
      }),
    }),
    drawerHeader: css({
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(0, 0.8),
      // css({...theme.mixins.toolbar}),
      justifyContent: "flex-end",
    }),
    fullHeight: css({
      display: "flex",
      flexDirection: "column",
    }),
    whiteBg: css({
      background: theme.drawer.color,
      color: theme.drawer.activeItemColor,
      height: "100%",
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

interface Props extends HiddenProps {
  children: React.ReactNode;
  smDown?: boolean;
}
export type SidebarClassKey = StyleClassKey<typeof useStyles>;
export interface SidebarProps
  extends StandardProps<DrawerProps, SidebarClassKey> {}

export function Sidebar(props: SidebarProps) {
  const classes = useStyles(props);
  const { children, className, ...rest } = props;
  const [sidebarState, setSidebarOpened] = useState(true);

  const content = (
    <div className={classes.whiteBg}>
      <DrawerTopView onClick={null} />
      {children}
      <DrawerBottomView onClick={null} />
    </div>
  );
  const leftDrawer = (
    <Drawer
      variant="persistent"
      anchor={"left"}
      {...rest}
      classes={{
        paper: clsx(className, classes.drawerPaper),
      }}
      onClose={() => setSidebarOpened(false)}
      open={sidebarState}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {content}
    </Drawer>
  );
  const mobileDrawer = (
    <Drawer
      style={{ flexGrow: 1 }}
      className={classes.fullHeight}
      variant={"temporary"}
      {...rest}
      onClose={() => setSidebarOpened(false)}
      open={sidebarState}
      classes={{
        paper: clsx(className, classes.drawerPaper),
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {content}
    </Drawer>
  );
  const leftHiddenProps: Props = { children: leftDrawer, smDown: true };
  const mobileHiddenProps: Props = { children: mobileDrawer, mdUp: true };

  return (
    <React.Fragment>
      <Hidden {...leftHiddenProps} />
      <Hidden {...mobileHiddenProps} />
    </React.Fragment>
  );
}

export default Sidebar;
