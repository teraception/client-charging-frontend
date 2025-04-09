import DeleteIcon from "@mui/icons-material/Delete";
import ReloadIcon from "@mui/icons-material/Cached";
import {
  MenuListComponentProps,
  MenuProps,
  NoticeProps,
} from "react-select/src/components/Menu";
import { MultiValueProps } from "react-select/src/components/MultiValue";
import { ValueContainerProps } from "react-select/src/components/containers";
import { PlaceholderProps } from "react-select/src/components/Placeholder";
import { OptionProps } from "react-select/src/components/Option";
import { ControlProps } from "react-select/src/components/Control";
import { FixedSizeList, FixedSizeListProps } from "react-window";
import { SelectComponentProps } from "./types";
import React from "react";
import clsx from "clsx";
import { SingleValueProps } from "react-select";
import {
  Chip,
  FormControl,
  IconButton,
  Input,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";

type TextFieldInputComponentProps<OptionType> = {
  className: string;
  inputRef: SelectComponentProps<ControlProps<OptionType>>["innerRef"];
  innerProps: SelectComponentProps<ControlProps<OptionType>>["innerProps"];
  children: SelectComponentProps<ControlProps<OptionType>>["children"];
  classes: SelectComponentProps<
    ControlProps<OptionType>
  >["selectProps"]["classes"];
  controlProps: SelectComponentProps<
    ControlProps<OptionType>
  >["selectProps"]["controlProps"];
};

function TextFieldInputComponent<OptionType>({
  inputRef,
  classes,
  controlProps,
  innerProps,
  ...props
}: TextFieldInputComponentProps<OptionType>) {
  return (
    <div className={classes.controlContainer}>
      <div
        style={{
          flexGrow: 1,
        }}
        ref={inputRef}
        {...innerProps}
        {...props}
      />
      {controlProps.allowReload && (
        <IconButton
          className={classes.reloadIcon}
          onClick={controlProps.onReload}
        >
          <ReloadIcon />
        </IconButton>
      )}
    </div>
  );
}

export function Control<OptionType>(
  props: SelectComponentProps<ControlProps<OptionType>>
) {
  const iProps = {
    className: props.selectProps.classes.input,
    inputRef: props.innerRef,
    children: props.children,
    classes: props.selectProps.classes,
    controlProps: props.selectProps.controlProps,
    innerProps: props.innerProps,
  };
  return (
    <FormControl
      className={props.selectProps.classes.formControl}
      fullWidth={props.selectProps.controlProps.fullWidth}
    >
      <Input
        className={props.selectProps.classes.formControlInput}
        disableUnderline
        inputComponent={TextFieldInputComponent}
        inputProps={iProps}
      />
    </FormControl>
  );
}

export function Option<OptionType>(
  props: SelectComponentProps<OptionProps<OptionType>>
) {
  return (
    <MenuItem
      ref={props.innerRef}
      selected={props.isSelected}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

export function Placeholder<OptionType>(
  props: SelectComponentProps<PlaceholderProps<OptionType>>
) {
  return (
    <Typography
    {...props.innerProps}
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
    >
      {props.children}
    </Typography>
  );
}

export function SingleValue<OptionType>(
  props: SelectComponentProps<SingleValueProps<OptionType>>
) {
  return (
    <Typography
    {...props.innerProps}
    className={props.selectProps.classes.singleValue}
    >
      {props.children}
    </Typography>
  );
}

export function ValueContainer<OptionType>(
  props: SelectComponentProps<ValueContainerProps<OptionType>>
) {
  return (
    <div className={props.selectProps.classes.valueContainer}>
      {props.children}
    </div>
  );
}

export function MultiValue<OptionType>(
  props: SelectComponentProps<MultiValueProps<OptionType>>
) {
  return (
    <Chip
      classes={{
        deleteIcon: props.selectProps.classes.deleteIconStyle,
        label: props.selectProps.classes.chipLabel,
      }}
      deleteIcon={<DeleteIcon {...props.removeProps} />}
      className={clsx(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused,
      })}
      color="primary"
      label={props.children}
      onDelete={props.removeProps.onClick}
    />
  );
}

export function Menu<OptionType>(
  props: SelectComponentProps<MenuProps<OptionType>>
) {
  return (
    <Paper
      elevation={0}
      square
      className={props.selectProps.classes.paper}
      {...props.innerProps}
    >
      {props.children}
    </Paper>
  );
}

export function MenuList<OptionType>(
  props: SelectComponentProps<MenuListComponentProps<OptionType>>
) {
  const other = props.selectProps.controlProps.fullWidth
    ? {
        width: "100%",
      }
    : {};

  const fixedSizeListProps: FixedSizeListProps = {
    ...other,
    ...props.selectProps.fixedSizeListProps,
  };
  const childs = props.children;
  const count = React.Children.count(childs);
  return (
    <FixedSizeList
      // innerRef={props.innerRef}
      itemSize={40}
      height={40 * Math.min(5, count)}
      itemCount={count}
      {...fixedSizeListProps}
    >
      {(renderProps) => (
        <div style={renderProps.style}>{childs[renderProps.index]}</div>
      )}
    </FixedSizeList>
  );
}

export function NoOptionsMessage<OptionType>(
  props: SelectComponentProps<NoticeProps<OptionType>>
) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}
