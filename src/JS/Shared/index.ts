// import { User } from "@teraception/client-payment-integration-lib";

import { User } from "JS/typingForNow/types";

export * from "@teraception/client-payment-integration-lib";

export interface LoggedInUserDTO {
  user: User;
}
export type IntegrationRefType = "ORGANIZATION" | "LOCATION";

export interface MicrosoftConfig {
  code?: string;
  refreshToken?: string;
  expiresIn?: number;
}
