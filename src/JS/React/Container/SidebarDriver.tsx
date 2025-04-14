import React, { ReactNode, useState } from "react";
import { defaultTo } from "lodash-es";
import { DrawerProps, List, Theme, Divider, Box } from "@mui/material";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import SidebarItem, {
  SidebarItemProps,
} from "JS/React/Components/Sidebar/SidebarItem";
import AddCardIcon from "@mui/icons-material/AddCard";
import PeopleIcon from "@mui/icons-material/People";
import Sidebar from "JS/React/Components/Sidebar/Sidebar";
import { useRouting } from "JS/React/Hooks/Routes";
import { withRouter } from "JS/Routing/RouteComponent/WithRoute";
import { useAccessHandler } from "JS/React/Hooks/AccessHandler";
import { useLoggedInUser } from "../../Routing/Context/LoggedInUseContextProvider";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import { ClientSelector } from "JS/React/Components/ClientSelector";
import FolderIcon from "@mui/icons-material/Folder";
import { useSelectedClient } from "JS/React/Context/SelectedClientContext";

const styles = (props: any, theme: Theme) => {
  return {
    headerPresenterRoot: css({
      "& *": css({
        color: theme.drawer.activeColor,
      }),
    }),
    listStyle: css({
      paddingLeft: theme.spacing(3),
      paddingTop: theme.spacing(0),
      paddingBottom: theme.spacing(0),
      "& *": css({
        color: theme.drawer.activeItemColor,
      }),
    }),
    grayColor: css({
      color: theme.drawer.activeItemColor,
    }),
    navPresenterRoot: css({
      "& *": css({
        color: theme.drawer.activeColor,
      }),
    }),
    iconColor: css({
      color: theme.drawer.activeItemColor,
    }),
    userNavList: css({
      "& *": css({
        color: theme.drawer.activeItemColor,
      }),
    }),
    navListDynamic: css({
      "&$navListDynamic": css({
        padding: 0,
      }),
      "& span.material-icons": css({
        overflow: "visible",
      }),
      "& a": css({
        textDecoration: "none",
      }),
    }),
  };
};
const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export interface BackendSidebarProps
  extends StandardProps<DrawerProps, StyleClassKey<typeof styles>> {}

interface SidebarItemState {
  expanded: boolean;
}

interface ItemStateMap {
  [identifier: string]: SidebarItemState;
}

const Component = (props: BackendSidebarProps) => {
  const classes = useStyles(props);
  const [itemsState, setItemState] = useState<ItemStateMap>({});
  const { linkProvider } = useRouting();
  const { isClient, isSuperAdmin } = useAccessHandler();
  const { loggedInUser } = useLoggedInUser();
  const { selectedClient } = useSelectedClient();
  const routeProvider = linkProvider;
  function getStateForItem(identifier: string): SidebarItemState {
    const state = defaultTo(itemsState[identifier], {
      loaded: true,
      expanded: false,
    });
    return state;
  }

  function toggleSidebarItem(
    e: React.MouseEvent<HTMLElement>,
    { identifier }: { identifier: string },
    stop?: boolean
  ) {
    if (stop) {
      e.preventDefault();
      e.stopPropagation();
    }
    const preState = getStateForItem(identifier);
    setItemState({
      ...itemsState,
      [identifier]: {
        ...preState,
        expanded: !preState.expanded,
      },
    });
  }

  function buildSidebarItems(item: SidebarItemProps, level = 0): ReactNode {
    const childs: ReactNode =
      item.hasChilds && item.childs ? (
        <List className={classes.listStyle}>
          {item.childs.map((item) => buildSidebarItems(item, level + 1))}
        </List>
      ) : null;
    return (
      <SidebarItem
        className={classes.grayColor}
        {...item}
        level={level}
        key={item.identifier}
      >
        {childs}
      </SidebarItem>
    );
  }
  function setCommonItemProps(item: SidebarItemProps): SidebarItemProps {
    return {
      ...item,
      ...getStateForItem(item.identifier),
      expandClicked: toggleSidebarItem,
      itemClicked: item.itemClicked,
      childs:
        item.expanded && item.hasChilds && item.childs
          ? item.childs.map((i) => setCommonItemProps(i))
          : item.childs,
    };
  }

  function markActiveItem(
    item: SidebarItemProps,
    path = window.location.pathname
  ): boolean {
    item.active = item.route === path;
    let childActive = false;
    if (!item.active && item.hasChilds && item.childs) {
      item.childs.forEach((i) => {
        if (!childActive) {
          childActive = markActiveItem(i, path);
        }
      });
    }
    item.active = item.active || childActive;
    return item.active;
  }

  function filterItems(
    items: SidebarItemProps<{
      skip?: boolean;
      permission?: any;
    }>[]
  ): SidebarItemProps[] {
    return items
      .filter(({ skip }) => {
        return !skip;
      })
      .map(({ skip, permission, childs, ...item }) => {
        if (item.hasChilds && item.expanded && childs.length > 0) {
          childs = filterItems(childs);
        }
        return { ...item, childs };
      });
  }

  function setActive(item: SidebarItemProps[]) {
    let active = false;
    item.forEach((i) => {
      if (!active) {
        active = markActiveItem(i);
      }
    });
    if (!active) {
      //must be dynamic data. In that case fallback to breadcrumbs
      const paths = window.location.pathname.split("/");
      paths.splice(paths.length - 1, 1);
      while (paths.length > 0 && !active) {
        const path = paths.join("/");
        paths.splice(paths.length - 1, 1);
        item.forEach((i) => {
          if (!active) {
            active = markActiveItem(i, path);
          }
        });
      }
    }
    return item;
  }

  function getSidebarItems() {
    const provider = routeProvider;
    let locationItems: SidebarItemProps<{
      skip?: boolean;
      permission?: any;
    }>[] = [];

    locationItems = [];

    // Super admin menu items
    if (isSuperAdmin) {
      locationItems.push({
        identifier: "users",
        title: "Users",
        hasChilds: false,
        button: true,
        skip: false,
        route: provider.react.users(),
        icon: <PeopleIcon className={classes.iconColor} />,
      });
      // locationItems.push({
      //   identifier: "clients",
      //   title: "Clients",
      //   hasChilds: false,
      //   button: true,
      //   skip: false,
      //   route: provider.react.clients(),
      //   icon: <AccessibilityIcon className={classes.iconColor} />,
      // });
    }

    // Client user menu items - only show if a client is selected
    if (isClient && selectedClient) {
      locationItems.push({
        identifier: "paymentMethods",
        title: "Payment Methods",
        hasChilds: false,
        button: true,
        skip: false,
        route: provider.react.paymentMethods(),
        icon: <AddCardIcon className={classes.iconColor} />,
      });
    }

    let sideBarItems: SidebarItemProps[] = [...locationItems];

    // Only add Projects menu item when a client is selected
    if (selectedClient || isSuperAdmin) {
      sideBarItems.push({
        identifier: "projects",
        title: "Projects",
        hasChilds: false,
        button: true,
        skip: false,
        route: provider.react.projects(),
        icon: <FolderIcon className={classes.iconColor} />,
      });
    }

    sideBarItems = filterItems(sideBarItems).map(setCommonItemProps);
    setActive(sideBarItems);
    return sideBarItems;
  }

  function getSidebarNav(items: SidebarItemProps[]): ReactNode {
    return (
      <>
        <Box sx={{ mt: 2 }}>
          <ClientSelector />
          <Divider sx={{ my: 1, backgroundColor: "white" }} />
        </Box>
        <List className={classes.navListDynamic}>
          {items.map((item) => buildSidebarItems(item))}
        </List>
      </>
    );
  }

  const { classes: asd, staticContext, ...rest } = props as any;
  const sideBarItems = getSidebarNav(getSidebarItems());

  return <Sidebar {...rest}>{sideBarItems}</Sidebar>;
};

Component.displayName = "Sidebar";
export const BackendSidebar = React.memo(withRouter(Component));
export default BackendSidebar;
