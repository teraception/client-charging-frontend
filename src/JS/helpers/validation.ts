import moment from "moment";
import { isNumber, toNumber } from "./utility";
import {
  addError,
  getInitializedValidityState,
  replaceError,
  ValidityState,
} from "JS/types";

export interface InputValidationRule {
  rule: Validations;
  message?: string;
  options?: any;
}

export interface RuleDefinition {
  validate: (value: any, options: any) => boolean;
  formatMessage: (
    message: string,
    fieldName: string,
    value: any,
    options: any
  ) => string;
}

export enum Validations {
  REQUIRED = "required",
  NUMBER = "number",
  EMAIL = "email",
  NON_ZERO = "non_zero",
  MIN_VALUE = "min_value",
  MIN_LENGTH = "min_length",
  MAX_VALUE = "max_value",
  REGEX = "regex",
  MIN_DATE = "min_date",
  MAX_DATE = "max_date",
  VALID_DATE = "valid_date",
  PHONE_NUMBER = "phone_number",
  CONFIRM = "confirm",
  URL = "URL",
}

export type ErrorsObj<T extends string> = Partial<Record<T, boolean>>;
export type ValidationRules<T extends string> = Partial<
  Record<T, InputValidationRule[]>
>;

const validators: { [index in Validations]?: RuleDefinition } = {
  [Validations.EMAIL]: {
    validate: (str: string) => {
      const mailFormat = new RegExp(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      if (str && mailFormat.exec(str)) {
        return true;
      } else {
        return false;
      }
    },
    formatMessage: (message) =>
      message ? message : `Entered email is invalid`,
  },
  [Validations.URL]: {
    validate: (str: string) => {
      let url: URL;

      try {
        url = new URL(str);
      } catch (_) {
        return false;
      }

      return url.protocol === "http:" || url.protocol === "https:";
    },
    formatMessage: (message) => (message ? message : `Enter a valid url`),
  },
  [Validations.MIN_LENGTH]: {
    validate: (str: string, options: any) => {
      if (str && str.length >= options.value) {
        return true;
      } else {
        return false;
      }
    },
    formatMessage: (message, field: string, value, { value: len }) =>
      message ? message : `${field} must be atleast ${len} characters long`,
  },
  [Validations.REGEX]: {
    validate: (str: string, options: any) => {
      const exp: RegExp = options.regex;
      if (exp.test(str)) {
        return true;
      } else {
        return false;
      }
    },
    formatMessage: (message, field: string, value, { value: len }) =>
      message ? message : `${field} does not match required input syntax`,
  },
  [Validations.REQUIRED]: {
    validate: (value) =>
      !!(
        value !== undefined &&
        value !== null &&
        value.toString().trim().length > 0
      ),
    formatMessage: (message, field: string) => {
      return message ? message : `${field} is required`;
    },
  },
  [Validations.NON_ZERO]: {
    validate: (value: any) => toNumber(value) !== 0,
    formatMessage: (message, field: string) =>
      message ? message : `${field} can't be zero`,
  },
  [Validations.NUMBER]: {
    validate: (str: any, options: any) => {
      const requiredPass = validators[Validations.REQUIRED].validate(
        str,
        options
      );
      if (!requiredPass || isNumber(str)) {
        return true;
      } else {
        return false;
      }
    },
    formatMessage: (message) => (message ? message : `Not a number`),
  },
  [Validations.MIN_VALUE]: {
    validate: (value: any, options) => {
      const requiredPass = validators[Validations.REQUIRED].validate(
        value,
        options
      );
      const { value: limit = 0 } = options;
      if (!requiredPass || (isNumber(value) && toNumber(value) >= limit)) {
        return true;
      } else {
        return false;
      }
    },
    formatMessage: (message, field: string, value, { limit = 0 } = {}) =>
      message ? message : `${field} can't be less than ${limit}`,
  },
  [Validations.MAX_VALUE]: {
    validate: (value: any, options) => {
      const requiredPass = validators[Validations.REQUIRED].validate(
        value,
        options
      );
      const { value: limit = 0 } = options;
      if (!requiredPass || (isNumber(value) && toNumber(value) <= limit)) {
        return true;
      } else {
        return false;
      }
    },
    formatMessage: (message, field: string, value, { limit = Infinity } = {}) =>
      message ? message : `${field} can't be greater than ${limit}`,
  },
  [Validations.CONFIRM]: {
    validate: (value: any, { confirmValue = null } = {}) => {
      if (value === confirmValue) {
        return true;
      }

      return false;
    },
    formatMessage: (message) => (message ? message : `Not matched`),
  },
  [Validations.VALID_DATE]: {
    validate: (value: any) => moment(value, "YYYY-MM-DD", true).isValid(),
    formatMessage: (message) => (message ? message : `Entered date is invalid`),
  },
  [Validations.MIN_DATE]: {
    validate: (value: any, { min = null } = {}) => {
      const currentDate = moment(value, "YYYY-MM-DD", true);
      const minDate = moment(min, "YYYY-MM-DD", true);
      if (currentDate.isBefore(minDate)) {
        return false;
      } else {
        return true;
      }
    },
    formatMessage: (message) => (message ? message : `Date is out of scope`),
  },
  [Validations.MAX_DATE]: {
    validate: (value: any, { max = null } = {}) => {
      const currentDate = moment(value, "YYYY-MM-DD", true);
      const maxDate = moment(max, "YYYY-MM-DD", true);
      if (currentDate.isAfter(maxDate)) {
        return false;
      } else {
        return true;
      }
    },
    formatMessage: (message) => (message ? message : `Date is out of scope`),
  },
};

export function applyValidations(
  state: ValidityState,
  rules: InputValidationRule[],
  value: any,
  field: string
): ValidityState {
  let isValid = true;
  rules.forEach((rule) => {
    const options = rule.options || {};
    const result = !validators[rule.rule].validate(value, options);

    if (result) {
      isValid = false;
      state = addError(state, field, {
        code: rule.rule,
        message: rule.message
          ? rule.message
          : validators[rule.rule].formatMessage(
              rule.message,
              field,
              value,
              options
            ),
      });
    }
  });
  if (isValid) {
    state = replaceError(state, field, null);
  }
  return state;
}

export function getInitializedValidityStateFromRules(
  rules: ValidationRules<string>,
  values: { [index: string]: any },
  state = getInitializedValidityState([], [])
): ValidityState {
  for (const k of Object.keys(rules)) {
    state = applyValidations(state, rules[k], values[k], k);
  }
  return state;
}
