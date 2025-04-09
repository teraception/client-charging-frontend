import { FieldState } from "JS/types/ValidityState";
import AppTextField, { AppTextFieldProps } from "./AppTextField";

export type TextFieldWithErrorProps = AppTextFieldProps & {
  errorInfo?: FieldState;
};

export const TextFieldWithError = ({
  errorInfo,
  ...rest
}: TextFieldWithErrorProps) => {
  return (
    <AppTextField
      helperText={
        errorInfo && errorInfo.errors.length > 0
          ? errorInfo.errors[0].message
          : ""
      }
      error={errorInfo && errorInfo.errors.length > 0}
      {...rest}
    />
  );
};

export default TextFieldWithError;
