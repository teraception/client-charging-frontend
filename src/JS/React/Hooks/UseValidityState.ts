import { useEffect, useMemo, useState } from "react";
import {
  ValidationRules,
  getInitializedValidityStateFromRules,
} from "JS/helpers";
import {
  merge,
  getFieldState,
  processValidityState,
  isStateValid,
  getInitializedValidityState,
} from "JS/types";

export const useValidityState = <T, E = any>(
  initialData: T,
  validationRules: ValidationRules<Exclude<string, E>>
) => {
  const [data, setData] = useState<T>(initialData);
  const [isValidationEnabled, setValidationsEnabled] = useState(false);

  const [serverValidityState, setServerValidityState] = useState(
    getInitializedValidityState([], [])
  );

  async function submitFormIfValid(
    callback: (param: T) => Promise<void> | void
  ) {
    const state = getInitializedValidityStateFromRules(validationRules, data);
    if (!isStateValid(state)) {
      setValidationsEnabled(true);
    }
    if (isStateValid(state)) return callback(data);
  }

  const localValidityState = useMemo(() => {
    if (isValidationEnabled) {
      return getInitializedValidityStateFromRules(validationRules, data);
    }
    return getInitializedValidityState([], []);
  }, [data, isValidationEnabled]);

  const validityState = useMemo(
    () => merge(localValidityState, serverValidityState),
    [localValidityState, serverValidityState]
  );

  const isLocalFormValid = useMemo(() => {
    return isStateValid(localValidityState);
  }, [localValidityState]);

  useEffect(() => {
    processValidityState(validityState);
  }, [validityState]);

  const setDataHandler = (data: Partial<T>) => {
    setData((prevData) => ({ ...prevData, ...data }));
  };

  const clearData = () => {
    setData(null);
  };

  return {
    data,
    setData: setDataHandler,
    clearData: clearData,
    isValidationEnabled,
    setValidationsEnabled,
    localValidityState,
    serverValidityState,
    validityState,
    setServerValidityState,
    isLocalFormValid: isLocalFormValid,
    getFieldState: (fieldName: string) =>
      getFieldState(validityState, fieldName),
    submitFormIfValid,
  };
};
