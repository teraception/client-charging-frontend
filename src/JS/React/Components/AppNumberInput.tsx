import { useEffect } from "react";
import numeral from "numeral";
import { TextField, TextFieldProps } from "@mui/material";
import { useNumberInput } from "JS/React/Hooks/UseNumberInput";

export type AppNumberInputProps = Omit<TextFieldProps, "value"> & {
  onUpdate: (value: number) => void;
  value: number;
  min?: number;
  max?: number;
  numberVariant?: "integer" | "float";
  precision?: number;
};

export function AppNumberInput(props: AppNumberInputProps) {
  const {
    value,
    max = null,
    min = null,
    required,
    precision = null,
    numberVariant = "float",
    onUpdate,
    ...rest
  } = props;

  const {
    inputValue,
    value: numberValue,
    onInputChange,
  } = useNumberInput(value);

  useEffect(() => {
    onUpdate(numberValue);
  }, [numberValue]);

  const applyRules = (value: number) => {
    if (value != null) {
      if (min != null && value < min) {
        value = min;
      }
      if (max != null && value > max) {
        value = max;
      }
      if (numberVariant === "integer") {
        value = parseInt(value.toString());
      }
      if (precision != null) {
        value = numeral(value.toFixed(precision)).value();
      }
    } else if (required) {
      value = min != null ? min : max != null ? max : 0;
      value = applyRules(value);
    }
    return value;
  };

  const onBlur = (newValue: string) => {
    const newVal = applyRules(numberValue);
    onInputChange(newVal != null ? newVal.toString() : null);
  };

  return (
    <TextField
      value={inputValue}
      onChange={(event) => {
        onInputChange(event.target.value);
      }}
      onBlur={(event) => onBlur(event.target.value)}
      {...(rest as any)}
    />
  );
}

export default AppNumberInput;
