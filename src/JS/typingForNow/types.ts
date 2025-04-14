import { PaymentMethod as StripePaymentMethodType } from "@stripe/stripe-js";

export interface PaginatedMeta {
  totalItems: number;
  start: number;
  end: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
}

export interface PaginationInfoDetail extends PaginatedMeta {
  currentPage: number;
  totalPages: number;
}
export function getDefaultPaginationInfo(): PaginationInfoDetail {
  return {
    currentPage: 0,
    end: 0,
    start: 0,
    totalItems: 0,
    totalPages: 0,
    perPage: 25,
  };
}
export function extractPaginationDetail(
  info: PaginatedMeta
): PaginationInfoDetail {
  if (info) {
    return {
      ...info,
      currentPage: Math.floor(info.start / info.perPage) + 1,
      totalPages: parseInt(
        Math.ceil(info.totalItems / info.perPage).toString()
      ),
    };
  } else {
    return getDefaultPaginationInfo();
  }
}

export interface PaginatedResponse<T> {
  items: T[];
  paginationMeta: PaginatedMeta;
}

export interface PaginationParam {
  pageNumber: number;
  perPage: number;
}

export function getOffsetFromPagination(pagination: PaginationParam) {
  if (!pagination || !pagination.perPage || pagination.perPage == null) {
    return 0;
  }
  return (Math.max(pagination.pageNumber, 1) - 1) * pagination.perPage;
}

export async function paginator(
  options: {
    initialPage: number;
    perPage: number;
  },
  runner: (paginationParams: PaginationParam) => Promise<PaginatedMeta>
) {
  const params: PaginationParam = {
    pageNumber: options.initialPage,
    perPage: options.perPage,
  };

  let detail: PaginationInfoDetail | null = null;
  do {
    const meta = await runner(params);
    params.pageNumber++;
    detail = extractPaginationDetail(meta);
  } while (detail.currentPage < detail.totalPages);
}

export function getPaginationMeta<T>(
  params: PaginationParam,
  result: {
    items: T[];
    total: number;
  }
): PaginatedMeta {
  const start = getOffsetFromPagination(params);

  return {
    totalPages: parseInt(Math.ceil(result.total / params.perPage).toString()),
    currentPage: params.pageNumber,
    start: start,
    end: start + result.items.length,
    perPage: params.perPage,
    totalItems: result.total,
  };
}

export function paginate<T>(
  data: T[],
  paginationDef: PaginationParam
): Omit<PaginatedResponse<T>, "status" | "errors"> {
  const start = getPaginationMeta(paginationDef, {
    items: data,
    total: data.length,
  });

  const items = data.slice(start.start, start.end);
  return {
    items: items,
    paginationMeta: start,
  };
}

export enum StatusCode {
  BAD_REQUEST = "BAD_REQUEST", //400
  UNAUTHORIZED = "UNAUTHENTICATED", //401
  MISSING_RESOURCE = "MISSING_RESOURCE", //404
  RATE_LIMIT = "RATE_LIMIT", //429
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR", //500
  SUCCESS = "SUCCESS", //200
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  FREELANCER_ERROR = "FREELANCER_ERROR",
  PROVISIONING_ERROR = "PROVISIONING_ERROR",
  INTEGRATION_ERROR = "INTEGRATION_ERROR",
}

export enum ServerCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  MISSING_RESOURCE = 404,
  RATE_LIMIT = 429,
  INTERNAL_SERVER_ERROR = 500,
  SUCCESS = 200,
}

export interface ErrorInfo {
  message: string;
  code: string;
}
export interface FieldState {
  identifier: string;
  errors: ErrorInfo[];
}

export interface ResponseMeta {
  paginationInfo?: PaginatedMeta;
}

export interface Response<T> {
  errors?: FieldState[];
  statusCode: StatusCode;
  data: T;
  meta?: ResponseMeta;
}

export enum Role {
  SUPER_ADMIN = "super_admin",
  CLIENT = "client",
}
export interface UserDTO
  extends Omit<
      User,
      "id" | "authId" | "signupAt" | "createdAt" | "updatedAt" | "isBlocked"
    >,
    Partial<Pick<User, "id" | "authId" | "signupAt" | "isBlocked">> {}
export interface User {
  id?: string;
  email: string;
  name?: string;
  role: Role[];
  authId: string;
  signupAt: number;
  isBlocked?: boolean;
  createdAt?: number;
  updatedAt?: number;
  clientIds?: string[];
}
export enum UserGender {
  MALE = "male",
  FEMALE = "female",
}

import { keyBy } from "lodash-es";

export const roleOptions: { name: string; value: Role | "all" }[] = [
  { name: "All", value: "all" },
  { name: "Super Admin", value: Role.SUPER_ADMIN },
];

const roleEnumMap = keyBy(roleOptions, "value");

export function getRoleDisplayName(role?: Role) {
  return role && roleEnumMap[role] ? roleEnumMap[role].name : role;
}

export interface Client {
  id?: string;
  name: string;
  customerId?: string;
  projectIds?: string[];
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateClientDTO {
  name: string;
  userId?: string;
}

export interface UpdateClientDTO {
  name?: string;
  userId?: string;
}

export interface Project {
  id?: string;
  name: string;
  clientId: string;
  paymentMethodIds?: string[];
  createdAt?: number;
  updatedAt?: number;
}
export interface CreateProjectDto {
  name: string;
  paymentMethodIds?: string[];
  clientId: string;
}

export type PaymentIntegrationType = "stripe" | "paypal";
export interface PaymentMethod {
  id?: string;
  clientId: string;
  paymentIntegrationType: PaymentIntegrationType;
  paymentSetupIntentId?: string;
  createdAt?: number;
  updatedAt?: number;
}
export interface CreatePaymentMethodDto {
  clientId: string;
  projectId: string;
}

export interface StripePaymentMethod extends StripePaymentMethodType {
  dbLinkedProject: Project;
  dbLinkedPaymentMethod: PaymentMethod;
}

export interface Invoice {
  id?: string;
  platformInvoiceId?: string;
  platformInvoiceItemId?: string;
  clientId: string;
  projectId: string;
  amount: number;
  chargeDate: number;
  createdAt?: number;
  updatedAt?: number;
}
export interface CreateInvoiceDto {
  clientId: string;
  projectId: string;
  amount: number;
  chargeDate: number;
  platformInvoiceId?: string;
  platformInvoiceItemId?: string;
}

export interface StripeInvoiceObj extends StripeInvoiceType {
  dbInvoiceObject: Invoice;
}

// reference in backend
export interface StripeInvoiceType {}
