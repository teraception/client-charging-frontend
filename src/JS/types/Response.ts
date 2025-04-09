import {
  StatusCode,
  type Response,
} from "@teraception/employee-management-lib";

import {
  getInitializedValidityState,
  addError,
  replaceError,
  ValidityState,
} from "./ValidityState";
import { defaultTo } from "lodash-es";

export interface AppResponse<T> {
  statusCode?: StatusCode;
  data: T;
  meta?: Response<T>["meta"];
}

export type WithValidityState<T> = {
  [P in keyof T]: T[P];
} & {
  validityState: ValidityState;
};

export function extractResponseErrors<T>(
  response: Response<T>,
  defaultFields: string[] = []
): ValidityState {
  let toRet: ValidityState = getInitializedValidityState(null, defaultFields);
  if (response !== null) {
    if (response.statusCode !== StatusCode.SUCCESS) {
      if (response.statusCode === StatusCode.INTERNAL_SERVER_ERROR) {
        toRet = replaceError(toRet, "general", {
          code: response.statusCode,
          message: "Internal Server Error",
        });
      } else {
        if (response.errors) {
          response.errors.forEach((error) => {
            error.errors.forEach((e) => {
              toRet = addError(
                toRet,
                error.identifier ? error.identifier : "general",
                {
                  code: e.code,
                  message: defaultTo(e.message, "Unknown error"),
                }
              );
            });
          });
        }
      }
    }
  }

  return toRet;
}
