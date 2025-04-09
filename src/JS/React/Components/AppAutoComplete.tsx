import {
  Autocomplete,
  AutocompleteProps,
  Checkbox,
  Theme,
} from "@mui/material";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import TextFieldWithError from "./TextFieldWithError";

const styles = (props: any, theme: Theme) => {
  return {};
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);
export interface OptionType {
  id: string;
  name: string;
}
export type AppAutoCompleteClassKey = StyleClassKey<typeof useStyles>;
export interface AppAutoCompleteProps<T = OptionType>
  extends StandardProps<
    Partial<AutocompleteProps<T, boolean, boolean, boolean>>,
    AppAutoCompleteClassKey
  > {
  options: T[];
  labelFormat: (value: T | T[]) => string;
  currentValue: T | T[];
  handleChange: (value: T | T[]) => void;
  placeholder: string;
  isMulti?: boolean;
  styles?: any;
  disabled?: boolean;
}

export const AppAutoComplete = (props: AppAutoCompleteProps) => {
  const {
    options,
    labelFormat,
    currentValue,
    handleChange,
    placeholder,
    isMulti = true,
    styles,
    disabled = false,
    ...rest
  } = props;
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  return (
    <Autocomplete
      multiple={isMulti}
      disabled={disabled}
      id={placeholder}
      options={options}
      disableCloseOnSelect
      onChange={(e, values: OptionType[]) => {
        handleChange(values);
      }}
      value={currentValue}
      getOptionLabel={(option: OptionType) => labelFormat(option)}
      renderOption={(props, option: OptionType, { selected }) =>
        isMulti && (
          <li {...props}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option.name}
          </li>
        )
      }
      renderInput={(params) => (
        <TextFieldWithError
          {...params}
          variant="standard"
          label={placeholder}
        />
      )}
      className={styles}
      {...rest}
    />
  );
};
