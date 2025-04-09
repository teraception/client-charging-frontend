import { defaultTo } from "lodash-es";

export interface ErrorInfo {
  message: string;
  code: string;
}
export interface FieldState {
  children: ValidityState;
  identifier: string;
  errors: ErrorInfo[];
}

export type ValidityState = FieldState[];
export function getInitializedValidityState<T = string>(
  state: ValidityState,
  identifiers: Readonly<string | string[] | keyof T | Array<keyof T>>
) {
  state = defaultTo(state, [] as ValidityState);
  if (typeof identifiers === "string") {
    state = getInitializedValidityState(state, [identifiers]);
  } else if (
    typeof identifiers === "number" ||
    typeof identifiers === "symbol"
  ) {
    state = getInitializedValidityState(state, [identifiers.toString()]);
  } else {
    identifiers.forEach((f) => {
      if (!state.find((a) => a.identifier === f)) {
        state = [
          ...state,
          {
            children: [],
            errors: [],
            identifier: f,
          },
        ];
      }
    });
  }
  return state;
}

export function getFieldState<T>(
  state: ValidityState,
  identifier: keyof T | string
) {
  return getInitializedValidityState<T>(state, identifier).find(
    (a) => a.identifier === identifier
  );
}

export function getFirstErrorInfo(state: ValidityState, identifier: string) {
  return getFieldState(state, identifier).errors[0];
}
export function getErrorInfo(state: FieldState, code: string = null) {
  return code === null
    ? state.errors[0]
    : state.errors.find((a) => a.code === code);
}
export function isStateValid(state: ValidityState): boolean {
  state = defaultTo<ValidityState>(state, [] as ValidityState);
  return state.reduce((pre, f) => {
    return pre && f.errors.length === 0 && isStateValid(f.children);
  }, true);
}
export function getFirstErrorFor(
  validityState: ValidityState,
  identifiers: Readonly<string[]>
) {
  let info: ErrorInfo = null;
  identifiers.forEach((field) => {
    if (!info) {
      info = getFirstErrorInfo(validityState, field);
    }
  });
  return info;
}
export function addError(
  validityState: ValidityState,
  identifier: string,
  error: ErrorInfo
) {
  validityState = getInitializedValidityState(validityState, identifier);
  return validityState.map((a) => {
    if (a.identifier === identifier && error) {
      return {
        ...a,
        errors: [...a.errors, error],
      };
    }
    return a;
  });
}
export function replaceError(
  validityState: ValidityState,
  identifier: string,
  error: ErrorInfo
) {
  validityState = getInitializedValidityState(validityState, identifier);
  return validityState.map((a) => {
    if (a.identifier === identifier) {
      return {
        ...a,
        errors: error ? [error] : [],
      };
    }
    return a;
  });
}
export function replaceFieldState(
  validityState: ValidityState,
  identifier: string,
  fieldState: FieldState
) {
  const old = validityState.find((a) => a.identifier === identifier);
  if (old !== undefined && old !== null) {
    if (fieldState === null) {
      //delete
      validityState = validityState.filter((a) => a.identifier !== identifier);
    }
    //update
    else {
      validityState = validityState.map((a) => {
        if (a.identifier === identifier) {
          return fieldState;
        }
        return a;
      });
    }
  } else {
    //add
    validityState = [...validityState, fieldState];
  }
  return validityState;
}

export function merge(dest: ValidityState, withState: ValidityState) {
  let state = getInitializedValidityState(dest, []);
  withState.map((field) => {
    field.errors.forEach((error) => {
      state = addError(state, field.identifier, error);
    });
    const destField = getFieldState(state, field.identifier);
    state = replaceFieldState(state, field.identifier, {
      ...destField,
      children: merge(destField.children, field.children),
    });
  });
  return state;
}

export function isStateValidForKeys(
  state: ValidityState,
  keys: string[]
): boolean {
  state = defaultTo<ValidityState>(state, [] as ValidityState);
  return state.reduce((pre, f) => {
    return (
      pre &&
      (!keys.includes(f.identifier) ||
        (keys.includes(f.identifier) &&
          f.errors.length === 0 &&
          isStateValid(f.children)))
    );
  }, true);
}
