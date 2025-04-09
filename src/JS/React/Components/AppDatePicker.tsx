import * as React from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";

import { Theme } from "@mui/material";
import dayjs from "dayjs";
import clsx from "clsx";
import { FieldState } from "@teraception/employee-management-lib";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

export type AppDatePickerClassKey = StyleClassKey<typeof useStyles>;

const styles = (props: any, theme: Theme) => {
  return {
    root: css({
      "& .MuiInputBase-input": {
        padding: theme.spacing(0.5, 1),
        fontSize: "0.9rem",
      },
      "& .MuiInputAdornment-root": {
        "& .MuiButtonBase-root": {
          padding: theme.spacing(0, 0.5),
        },
      },
      "& .MuiStack-root.css-4jnixx-MuiStack-root": {
        padding: theme.spacing(0.5, 0),
      },
      "& .MuiOutlinedInput-root": {
        minHeight: "30px !important",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.main,
          "&:hover, &:focus": {
            borderColor: theme.palette.primary.dark,
          },
          "& legend": {
            width: "0px !important",
          },
        },
        "&.Mui-error .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.main,
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderWidth: "1.5px !important",
        },
      },
      "& .MuiFormHelperText-contained": {
        margin: theme.spacing(0.75, 0.25, 0),
      },
      "& .MuiInputLabel-outlined": {
        transform: `translate(14px, 12px) scale(1)`,
        "&.MuiInputLabel-shrink": {
          transform: `translate(2px, -18px) scale(0.75) !important`,
        },
      },
      "& label": {
        color: theme.palette.grey["500"],
        fontWeight: 500,
        "&.Mui-focused": {
          color: theme.palette.primary.main,
        },
        "&.Mui-error": {
          color: `${theme.palette.grey["500"]} !important`,
        },
      },
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);
export interface AppDatePickerProps<TDate>
  extends DatePickerProps<TDate>,
    React.RefAttributes<HTMLDivElement> {
  value: TDate;
  onChange: (unixTime: TDate) => void;
  errorInfo: FieldState;
}

function AppDatePicker(props: AppDatePickerProps<number>) {
  const { onChange, value, className, label = "", ...rest } = props;
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      onChange(date.unix());
    }
  };
  const classes = useStyles(props);
  return (
    <React.Fragment>
      {" "}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label={label}
          value={value === null ? dayjs() : dayjs.unix(value)}
          onChange={handleDateChange}
          className={clsx(className, classes.root)}
          onError={(error, value) => {
            console.log(error);
          }}
        />
      </LocalizationProvider>
    </React.Fragment>
  );
}

export default AppDatePicker;
