import React, { Fragment, useEffect, useMemo, useState } from "react";
import Helmet from "react-helmet";
import HeaderContainer from "JS/React/Components/HeadContainer";
import {
  CircularProgress,
  Grid,
  Menu,
  MenuItem,
  Theme,
  Typography,
  Box,
} from "@mui/material";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import BackendSidebar from "JS/React/Container/SidebarDriver";
import {
  LayoutContext,
  LayoutContextSetting,
  LayoutContextValue,
  getLayoutContextDefault,
} from "./LayoutContext";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useRouting } from "JS/React/Hooks/Routes";
import { Dashboard } from "JS/React/Scenes/Pages/Dashboard";
import clsx from "clsx";
import { useAuth } from "JS/Cognito/CognitoContextProvider";
import { useLoggedInUser } from "JS/Routing/Context/LoggedInUseContextProvider";
// import { Role } from "@teraception/client-payment-integration-lib";
import { UserComponent } from "../Pages/user";
import { useAccessHandler } from "JS/React/Hooks/AccessHandler";
import AppButton from "JS/React/Components/AppButton";
import { ClientComponent } from "../Pages/client";
import { PaymentMethodComponent } from "../Pages/client/PaymentMethod";
import { StripeIndex } from "JS/React/stripe/Index";
import { PaymentSetupComplete } from "JS/React/stripe/SetupComplete";
import { useSelectedClient } from "JS/React/Context/SelectedClientContext";
import { ProjectsComponent } from "../Pages/projects/Projects";
import Invoices from "../Pages/Invoices";

const styles = (props: any, theme: Theme) => ({
  main: css({
    display: "flex",
    "& .MuiDrawer-docked .MuiPaper-root": css({
      boxShadow: "3px 0px 10px rgba(0,0,0,.1)",
    }),
  }),
  content: css({
    width: `-webkit-calc(100% - ${theme.drawer.width})`,
    flexGrow: 1,
    marginTop: theme.header.height,
    padding: theme.spacing(1, 3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    marginLeft: 0,
    [theme.breakpoints.up("md")]: css({
      paddingLeft: theme.spacing(4),
    }),
    "&$noPadding": css({
      padding: 0,
    }),
    "&$heightAdjust": css({
      height: `calc(100vh - ${theme.header.height})`,
    }),
    "&$hideScroll": css({
      overflow: "hidden",
    }),
  }),
  contentShift: css({
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.up(theme.drawer.breakpoint)]: css({
      marginLeft: `${theme.drawer.width}`,
    }),
  }),
  noPadding: css({}),
  heightAdjust: css({}),
  hideScroll: css({}),
});

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export interface LayoutProps {}

export const Layout = (props: LayoutProps) => {
  const classes = useStyles(props);
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();
  const navigate = useNavigate();
  const { logOut } = useAuth();
  const { loggedInUser } = useLoggedInUser();
  const { selectedClient } = useSelectedClient();
  const [sidebarState, setSidebarOpened] = useState(true);
  const [loggedOutLoader, setLoggedOutLoader] = useState<boolean>(false);
  const [showUserActionDropdown, setShowUserActionDropdown] =
    useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [layoutContextSetting, setLayoutContext] =
    useState<LayoutContextSetting>(getLayoutContextDefault());
  const { isSuperAdmin, isClient } = useAccessHandler();
  const layoutContextValue = useMemo((): LayoutContextValue => {
    return {
      ...layoutContextSetting,
      reset: () => setLayoutContext(getLayoutContextDefault()),
      set: (value) => setLayoutContext((old) => ({ ...old, ...value })),
    };
  }, [layoutContextSetting]);

  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 960) {
        setSidebarOpened(false);
      }
    });
  }, []);

  // Effect to handle client selection and routing
  useEffect(() => {
    const currentPath = window.location.pathname;

    // For client users with selected client, redirect to projects if on dashboard
    if (
      isClient &&
      selectedClient &&
      currentPath === routeProvider.react.dashboard()
    ) {
      navigate(routeProvider.react.projects());
    }
  }, [selectedClient, isClient, navigate, routeProvider]);

  const commonRoutes = (
    <>
      <Route path={""} key={"dashboard"} element={<Dashboard />} />
      <Route path={"clients/projects"} element={<ProjectsComponent />} />
      <Route path={"clients/invoices"} element={<Invoices />} />
      <Route
        path={"clients/payment-methods"}
        key={"paymentMethods"}
        element={<PaymentMethodComponent />}
      />
    </>
  );

  const superAdminRoutes = (
    <Routes>
      {commonRoutes}
      <Route path={"users"}>
        <Route index element={<UserComponent />} />
      </Route>
      <Route path={"clients"} key={"clients"} element={<ClientComponent />} />
    </Routes>
  );

  const clientRoutes = (
    <Routes>
      {commonRoutes}

      <Route
        path="clients/payment-setup-complete"
        key={"paymentSetupComplete"}
        element={<PaymentSetupComplete />}
      />
      <Route
        path="clients/:id/payment-methods/add"
        key={"paymentSetup"}
        element={<StripeIndex />}
      />
    </Routes>
  );

  return (
    <Fragment>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <HeaderContainer>
        <Grid container justifyContent={"end"} alignItems={"center"}>
          <AppButton
            buttonVariant="emp-text"
            variant="text"
            onClick={(event: React.MouseEvent<HTMLElement>) => {
              setAnchorEl(event.currentTarget);
              setShowUserActionDropdown(true);
            }}
          >
            {loggedInUser?.user?.email}
          </AppButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={showUserActionDropdown}
            onClose={() => setShowUserActionDropdown(false)}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <MenuItem
              onClick={async () => {
                setShowUserActionDropdown(false);
                setLoggedOutLoader(true);
                await logOut();
                setLoggedOutLoader(false);
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Grid>
      </HeaderContainer>
      <BackendSidebar />
      <LayoutContext.Provider value={layoutContextValue}>
        <div className={classes.main}>
          <div
            className={clsx(classes.content, layoutContextValue.contentClass, {
              [classes.heightAdjust]: layoutContextValue.setContentHeight,
              [classes.noPadding]: !layoutContextValue.paddingEnabled,
              [classes.contentShift]: sidebarState,
              [classes.hideScroll]: layoutContextValue.hideScroll,
            })}
          >
            {isSuperAdmin && !selectedClient ? (
              <ClientComponent />
            ) : selectedClient ? (
              isSuperAdmin ? (
                superAdminRoutes
              ) : (
                clientRoutes
              )
            ) : isClient ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h5" gutterBottom>
                  Welcome to the Dashboard
                </Typography>
                <Typography>
                  Please select a client from the dropdown in the sidebar to
                  access your projects and payment methods.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h5" gutterBottom>
                  Please select a client
                </Typography>
                <Typography>
                  Select a client from the dropdown in the sidebar to view
                  content.
                </Typography>
              </Box>
            )}
          </div>
        </div>
      </LayoutContext.Provider>
      {loggedOutLoader && (
        <CircularProgress
          style={{ position: "fixed", top: "50%", left: "50%" }}
        />
      )}
    </Fragment>
  );
};
