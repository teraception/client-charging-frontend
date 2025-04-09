import React, { ReactNode, useState } from "react";
import { defaultTo } from "lodash-es";
import { DrawerProps, List, Theme } from "@mui/material";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import SidebarItem, {
  SidebarItemProps,
} from "JS/React/Components/Sidebar/SidebarItem";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import PowerIcon from "@mui/icons-material/Power";
import Sidebar from "JS/React/Components/Sidebar/Sidebar";
import { useRouting } from "JS/React/Hooks/Routes";
import { withRouter } from "JS/Routing/RouteComponent/WithRoute";
import { useAccessHandler } from "JS/React/Hooks/AccessHandler";
import { useLoggedInUser } from "../../Routing/Context/LoggedInUseContextProvider";
import GradingIcon from "@mui/icons-material/Grading";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import FeedIcon from "@mui/icons-material/Feed";
import PlusOneIcon from "@mui/icons-material/PlusOne";
import Settings from "@mui/icons-material/Settings";
import Diversity3Icon from "@mui/icons-material/Diversity3";

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
  const {
    isOrganizationLocationScopedDisabled,
    isOrganizationScopedDisabled,
    isHr,
    isEmployee,
  } = useAccessHandler();
  const { loggedInUser } = useLoggedInUser();
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

    locationItems = [
      {
        identifier: "employees",
        title: "Employees",
        hasChilds: false,
        button: true,
        skip: false,
        route: provider.react.employees(),
        icon: <PeopleIcon className={classes.iconColor} />,
        disabled: isOrganizationLocationScopedDisabled,
      },
      {
        identifier: "groups",
        title: "Groups",
        hasChilds: false,
        button: true,
        skip: false,
        route: provider.react.groups(),
        icon: <Diversity3Icon className={classes.iconColor} />,
        disabled: isOrganizationLocationScopedDisabled,
      },
      {
        identifier: "integrations",
        title: "Integrations",
        hasChilds: false,
        button: true,
        skip: false,
        route: provider.react.integrations(),
        icon: <PowerIcon className={classes.iconColor} />,
        disabled: isOrganizationLocationScopedDisabled,
      },
      {
        identifier: "users",
        title: "Users",
        hasChilds: false,
        button: true,
        skip: false,
        route: provider.react.users(),
        icon: <SettingsIcon className={classes.iconColor} />,
      },
      {
        identifier: "policies",
        title: "Policies",
        hasChilds: true,
        button: true,
        skip: false,
        icon: <FeedIcon className={classes.iconColor} />,
        disabled: isOrganizationScopedDisabled,
        childs: [
          {
            identifier: "leave policies",
            title: "Leave Policies",
            hasChilds: false,
            button: true,
            skip: false,
            route: provider.react.policies().leavePolicies(),
            icon: <GroupRemoveIcon className={classes.iconColor} />,
            disabled: isOrganizationScopedDisabled,
          },
          {
            identifier: "feedback policies",
            title: "Feedback Policies",
            hasChilds: false,
            button: true,
            skip: false,
            route: provider.react.policies().feedbackPolicies(),
            icon: <GradingIcon className={classes.iconColor} />,
            disabled: isOrganizationScopedDisabled,
          },
          {
            identifier: "incremental policies",
            title: "Incremental Policies",
            hasChilds: false,
            button: true,
            skip: false,
            route: provider.react.policies().incrementalPolicies(),
            icon: <PlusOneIcon className={classes.iconColor} />,
            disabled: isOrganizationScopedDisabled,
          },
        ],
      },
      {
        identifier: "account setting",
        title: "Account Settings",
        hasChilds: false,
        button: true,
        skip: false,
        route: provider.react.accountSetting(),
        icon: <Settings className={classes.iconColor} />,
        disabled: isOrganizationScopedDisabled,
      },
    ];
    if (isHr) {
      locationItems = locationItems.filter(
        (x) => x.identifier !== "integrations" && x.identifier !== "users"
      );
    }
    if (isEmployee) {
      locationItems = [
        {
          identifier: "manageYourself",
          title: "Manage Your Self",
          hasChilds: false,
          button: true,
          skip: false,
          route: provider.react.employeeDetails(loggedInUser?.employee?.id),
          icon: <PeopleIcon className={classes.iconColor} />,
          disabled: isOrganizationLocationScopedDisabled,
        },
      ];
    }
    let sideBarItems: SidebarItemProps[] = locationItems;

    sideBarItems = filterItems(sideBarItems).map(setCommonItemProps);
    setActive(sideBarItems);
    return sideBarItems;
  }

  function getSidebarNav(items: SidebarItemProps[]): ReactNode {
    return (
      <List className={classes.navListDynamic}>
        {items.map((item) => buildSidebarItems(item))}
      </List>
    );
  }

  const { classes: asd, staticContext, ...rest } = props as any;
  const sideBarItems = getSidebarNav(getSidebarItems());

  return <Sidebar {...rest}>{sideBarItems}</Sidebar>;
};

Component.displayName = "Sidebar";
export const BackendSidebar = React.memo(withRouter(Component));
export default BackendSidebar;
