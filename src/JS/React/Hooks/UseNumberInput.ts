import { useState } from "react";
import numeral from "numeral";

export function useNumberInput(defaultValue = 0) {
  const [textState, setTextState] = useState(
    defaultValue === null ? "" : defaultValue.toString()
  );

  const toNum = (value: string) => {
    if (value == null) {
      value = "";
    }
    return numeral(value).value();
  };

  const onInputChange = (value: string) => {
    if (value == null) {
      value = "";
    }
    value = value.trim();
    setTextState(value);
    return toNum(value);
  };

  return {
    inputValue: textState,
    onInputChange,
    value: toNum(textState),
  };
}
