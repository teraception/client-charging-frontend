// import { Platforms } from "@teraception/client-payment-integration-lib";
import { enqueueSnackbar } from "notistack";

export type AllKeys<O extends object, K = O[keyof O]> =
  | keyof O
  | (K extends any[] ? never : K extends object ? AllKeys<K> : never);

export const processValidityState = (validityState) => {
  if (validityState?.length) {
    validityState
      .filter((vs) => vs.identifier === "general")
      .forEach((vs) =>
        vs.errors.forEach((error) => {
          // enqueueSnackbar(error.message, {
          //   variant: "error",
          //   autoHideDuration: 3000,
          // })
        })
      );
  }
};
