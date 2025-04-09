import { Platforms } from "@teraception/employee-management-lib";
import { enqueueSnackbar } from "notistack";

export type AllKeys<O extends object, K = O[keyof O]> =
  | keyof O
  | (K extends any[] ? never : K extends object ? AllKeys<K> : never);

export const processValidityState = (validityState) => {
  if (validityState?.length) {
    validityState
      .filter(
        (vs) =>
          vs.identifier === "general" ||
          Object.values(Platforms).includes(vs.identifier)
      )
      .forEach((vs) =>
        vs.errors.forEach((error) =>
          enqueueSnackbar(error.message, {
            variant: "error",
            autoHideDuration: 3000,
          })
        )
      );
  }
};
