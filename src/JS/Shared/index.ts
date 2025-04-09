import {
  Employee,
  Location,
  Organization,
  User,
} from "@teraception/employee-management-lib";

export * from "@teraception/employee-management-lib";

export interface LoggedInUserDTO {
  organization: Organization;
  location: Location;
  user: User;
  employee: Employee;
}
export type IntegrationRefType = "ORGANIZATION" | "LOCATION";

export interface MicrosoftConfig {
  code?: string;
  refreshToken?: string;
  expiresIn?: number;
}
