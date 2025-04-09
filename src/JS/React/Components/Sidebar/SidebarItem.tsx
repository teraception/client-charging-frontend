import {
  Chip,
  Collapse,
  IconButton,
  ListItem,
  ListItemProps,
  ListItemText,
  Theme,
} from "@mui/material";
import { defaultTo } from "lodash-es";
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

const styles = (props: any, theme: Theme) => {
  return {
    itemContent: css({
      width: "100%",
      display: "flex",
      padding: theme.spacing(0.5, 0),
      paddingLeft: (props.level || 0) * parseInt(theme.spacing(3)),
      alignItems: "center",
      "& svg.svg-inline--fa": css({
        marginRight: theme.spacing(1.5),
      }),
      "& .MuiChip-label": css({
        color: theme.colors.darkGrey,
        padding: "0 6px 0 6px",
      }),
    }),
    item: css({
      "&$active": css({
        backgroundColor: theme.colors.jungleGreen,
        borderLeft: `solid ${theme.palette.primary.main} 5px`,
      }),
    }),
    betaChip: css({
      borderRadius: "5px",
      marginLeft: "10px",
      height: "19px",
      background: theme.colors.whiteIce,
      padding: "0px",
      cursor: "pointer",
      fontSize: "0.6rem",
    }),
    root: css({ display: "inherit" }),
    active: css({}),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export type SidebarItemClassKey = StyleClassKey<typeof useStyles>;

export type SidebarItemProps<T = any> = {
  childs?: SidebarItemProps<T>[];
  hasChilds: boolean;
  loaded?: boolean;
  active?: boolean;
  level?: number;
  icon?: ReactNode;
  expanded?: boolean;
  button?: boolean;
  route?: string;
  itemClicked?: (item: SidebarItemProps) => void;
  expandClicked?: (
    e: React.MouseEvent<HTMLElement>,
    item: SidebarItemProps
  ) => void;
  identifier: string;
  beta?: boolean;
} & T &
  StandardProps<ListItemProps, SidebarItemClassKey>;

export function SidebarItem(props: SidebarItemProps) {
  const {
    childs,
    active,
    level = 0,
    expandClicked = () => {},
    button,
    children,
    expanded,
    icon,
    hasChilds,
    identifier,
    route = null,
    itemClicked = () => {},
    loaded,
    ...rest
  } = props;

  const classes = useStyles(props, props.level);

  //won't collapse menu if it has active item
  const toggleAble: boolean =
    !expanded ||
    (expanded &&
      childs.reduce(
        (expand, c) => expand && !defaultTo(c.active, false),
        true
      ));

  return (
    <React.Fragment>
      <span className={clsx(classes.root)}>
        <ListItem
          to={route}
          component={route ? Link : "div"}
          dense
          {...rest}
          className={clsx(classes.item, {
            [classes.active]: active,
          })}
          onClick={(e) => {
            if (hasChilds && !rest.disabled && toggleAble) {
              expandClicked(e, props);
            } else if (itemClicked) {
              itemClicked(props);
            }
          }}
          button={button}
        >
          <div className={clsx(classes.itemContent)}>
            {icon}
            <ListItemText
              style={{
                textTransform: "uppercase",
              }}
              title={props.title}
            >
              {props.title}
              {props?.beta && (
                <Chip label="Beta" className={classes.betaChip} />
              )}
            </ListItemText>
            {hasChilds ? (
              <IconButton
                onClick={(e) =>
                  !rest.disabled && toggleAble
                    ? expandClicked(e, props, true)
                    : null
                }
                style={{
                  padding: "0px",
                }}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            ) : null}
          </div>
        </ListItem>
        {hasChilds ? (
          <Collapse in={expanded} unmountOnExit={true}>
            {children}
          </Collapse>
        ) : null}
      </span>
    </React.Fragment>
  );
}

export default SidebarItem;
