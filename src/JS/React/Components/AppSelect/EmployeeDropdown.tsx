import { useEffect } from "react";
import clsx from "clsx";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import { InputLabel, InputLabelProps, Theme } from "@mui/material";
import { StandardProps } from "JS/React/Types/Style";
import { useEmployees } from "JS/React/Hooks/Employees";
import AppSelect from "./AppSelect";
import { EmployeeInfo, User } from "@teraception/employee-management-lib";
import { processValidityState } from "JS/types";

const styles = (props: any, theme: Theme) => {
  return {
    root: css({
      position: "relative",
    }),
    hasLabel: css({
      marginTop: theme.spacing(2),
    }),
    labelClass: css({
      color: theme.palette.grey["500"],
      fontSize: "1rem",
      position: "absolute",
      fontWeight: 500,
      top: -18,
    }),
  };
};

type EmployeeDropdownClassKey = StyleClassKey<typeof useStyles>;

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);
export interface EmployeeDropdownProps
  extends StandardProps<{}, EmployeeDropdownClassKey> {
  onChange: (userId: string, adv: EmployeeInfo) => void;
  value: string;
  showLabel?: boolean;
  inputLabelProps?: InputLabelProps;
}

function Component(props: EmployeeDropdownProps) {
  const classes = useStyles(props);
  const { value, onChange, showLabel, inputLabelProps } = props;
  const { employees, getEmpsResponse } = useEmployees();

  useEffect(() => {
    processValidityState(getEmpsResponse?.validityState);
  }, [getEmpsResponse]);

  return (
    <>
      <span className={classes.root}>
        {showLabel && (
          <InputLabel
            {...inputLabelProps}
            className={clsx(
              classes.labelClass,
              inputLabelProps ? inputLabelProps.className : null
            )}
          />
        )}
        <AppSelect
          // menuIsOpen
          fullWidth
          placeholder={"Choose Superior"}
          options={employees || []}
          onChange={(val: EmployeeInfo) => {
            onChange((val.user as User)?.id, val);
          }}
          filterOption={({ label, value, data }, search) => {
            return (
              search === null ||
              search.length === 0 ||
              data.user.id.toLowerCase().includes(search.toLowerCase()) ||
              (data.empName != null &&
                data.empName.toLowerCase().includes(search.toLowerCase())) ||
              (data.recordId != null &&
                data.recordId.toLowerCase().includes(search.toLowerCase()))
            );
          }}
          getOptionLabel={(value: EmployeeInfo) => value.name}
          getOptionValue={(value: EmployeeInfo) => {
            return (value?.user as User)?.id;
          }}
          value={employees?.filter((e) => (e?.user as User)?.id === value)}
        />
      </span>
    </>
  );
}

Component.defaultProps = {} as EmployeeDropdownProps;
Component.displayName = "EmployeeDropdown";
export const EmployeeDropdown = Component;
export default EmployeeDropdown;
