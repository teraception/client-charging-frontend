import React from "react";
import { defaults } from "lodash-es";
import clsx from "clsx";
import { FixedSizeListProps } from "react-window";
import { CustomSelectComponentSelectProps } from "./types";
import {
  Option,
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Placeholder,
  SingleValue,
  ValueContainer,
} from "./CustomComponents";
import { Props } from "react-select";
import { Theme, useTheme } from "@mui/material";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

const styles = (props: any, theme: Theme) => {
  return {
    root: css({
      "& .MuiFormControl-fullWidth": css({
        width: "100%",
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 4,
      }),
    }),
    formControl: css({
      height: "auto",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      minHeight: "30px",
      "&:hover": css({}),
    }),
    formControlInput: css({
      minHeight: "30px",
    }),
    input: css({
      display: "flex!important",
      height: "auto",
      padding: 0,
      alignItems: "center",
    }),
    controlContainer: css({
      display: "flex",
      flexGrow: 1,
    }),
    valueContainer: css({
      display: "flex!important",
      flexWrap: "wrap",
      flex: 1,
      alignItems: "center",
      "&>input": css({
        width: 0,
      }),
      "&>p": css({
        paddingLeft: 8,
        paddingRight: 8,
      }),
      "&>div": css({}),
    }),
    noOptionsMessage: css({
      padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    }),
    singleValue: css({
      fontSize: 16,
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    }),
    placeholder: css({
      position: "absolute",
      left: 2,
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      fontSize: 16,
    }),
    paper: css({
      border: `1px solid ${theme.palette.grey.A100}`,
      background: theme.palette.background.paper,
      position: "absolute",
      zIndex: 2,
      marginTop: theme.spacing(0.125),
      left: 0,
      right: 0,
    }),
    chip: css({
      backgroundColor: theme.palette.grey["100"],
      color: theme.palette.common.black,
      padding: theme.spacing(0),
      margin: theme.spacing(0.25),
      justifyContent: "space-between",
      height: theme.spacing(2.5),
      minWidth: theme.spacing(7),
    }),
    chipLabel: css({}),
    chipFocused: css({}),
    deleteIconStyle: css({
      color: theme.palette.grey["700"],
      fontSize: "0.9rem",
      marginRight: theme.spacing(0.6),
    }),
    reloadIcon: css({
      alignSelf: "flex-start",
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export type CustomSelectClassKey = StyleClassKey<typeof useStyles>;

const ccomponents = {
  Control,
  // MenuList,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
};

interface PrivateProps extends StandardProps<{}, CustomSelectClassKey> {
  showDropdownIndicator?: boolean;
  fullWidth?: boolean;
  fixedSizeListProps?: FixedSizeListProps;
  allowReload?: boolean;
  onReload?: () => void;
}

export type CustomSelectProps<
  TProps extends Props<OptionType>,
  OptionType
> = PrivateProps &
  TProps & {
    Component: React.ComponentType<TProps>;
  };

function Component<
  TProps extends CustomSelectProps<SProps, OptionType>,
  SProps extends Props<OptionType>,
  OptionType
>(props: TProps) {
  let {
    styles,
    showDropdownIndicator,
    components,
    classes,
    fullWidth,
    allowReload,
    onReload,
    fixedSizeListProps,
  } = props;
  classes = useStyles(props);
  const theme = useTheme<Theme>();

  defaults(components, {
    Control: ccomponents.Control,
    // MenuList: ccomponents.MenuList,
    Menu: ccomponents.Menu,
    MultiValue: ccomponents.MultiValue,
    NoOptionsMessage: ccomponents.NoOptionsMessage,
    Option: ccomponents.Option,
    Placeholder: ccomponents.Placeholder,
    SingleValue: ccomponents.SingleValue,
    ValueContainer: ccomponents.ValueContainer,
  });

  const extraInjectedProps: CustomSelectComponentSelectProps = {
    classes,
    controlProps: {
      fullWidth: fullWidth,
      allowReload,
      onReload,
    },
    fixedSizeListProps: fixedSizeListProps,
  };

  const TComponent: React.ComponentType<SProps> = props.Component;

  return (
    <TComponent
      {...props}
      className={clsx(props.className, classes.root, {
        [classes.fullWidth]: fullWidth,
      })}
      {...extraInjectedProps}
      styles={{
        indicatorsContainer: (base) => ({
          ...base,
          "&>div": {
            padding: theme.spacing(0, 1, 0, 0),
            cursor: "pointer",
          },
        }),
        input: (base) => ({
          ...base,
          paddingLeft: theme.spacing(0.625),
          paddingRight: theme.spacing(0.625),
          "&>div>input": {
            maxWidth: "218px !important",
          },
        }),

        indicatorSeparator: (base) => ({
          ...base,
          display: "none",
        }),
        dropdownIndicator: (base) => ({
          ...base,
          display: !showDropdownIndicator ? "none" : undefined,
        }),
        ...styles,
      }}
    />
  );
}
Component.displayName = "CustomSelect";
Component.defaultProps = {
  menuShouldBlockScroll: false,
  showDropdownIndicator: true,
  hideSelectedOptions: false,
  components: ccomponents,
  filterOption: undefined,
  isMulti: false,
  isSearchable: true,
  placeholder: "",
  isClearable: false,
  allowReload: false,
  onReload: () => {},
  value: null,
  fullWidth: false,
};

export const CustomSelect = Component;
export default CustomSelect;
