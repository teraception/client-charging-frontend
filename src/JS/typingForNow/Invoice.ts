import { Content } from "./File";
import { Client, Project } from "./types";

export interface platformInvoiceData {
  platformInvoiceId?: string;
  platformInvoiceItemId?: string;
}

export enum InvoiceStatus {
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  DELETED = "DELETED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  FINALIZED = "FINALIZED",
  FINALIZATION_FAILED = "FINALIZATION_FAILED",
  UNCOLLECTIBLE = "UNCOLLECTIBLE",
  ACTION_REQUIRED = "ACTION_REQUIRED",
  PROCESSING = "PROCESSING",
}

export interface Invoice {
  id?: string;
  clientId: string;
  projectId: string;
  currency: string;
  amount: number;
  amountPaid: number;
  paidAt: number | null;
  description?: string;
  attachments?: Content[];
  platformInvoiceData?: platformInvoiceData;
  timezone: string;
  // short ID for invoice to send in email to client
  shortId: string;
  status: InvoiceStatus;
  //  the time for the cron job to schedule the invoice and create the stripe invoice
  // the stripe will be created with the invoiceSendDateTime so it will charge at that time
  sendDateTime: number; // will be epoch for invoice send date, time and timezone
  // the actual charge day and time
  chargeDayTime: number; // will be epoch for charge day and time (day will be relative like after 2 days or so...)
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateInvoiceDto
  extends Omit<
    Invoice,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "platformInvoiceData"
    | "amountPaid"
    | "paidAt"
  > {}
export interface InvoiceDto extends Invoice {
  project?: Project | null;
  client?: Client | null;
  previewInvoiceMeta?: PreviewInvoiceMeta;
}

export interface PreviewInvoiceMeta {
  attachmentLinks?: string[];
  contactEmail?: string;
  contactPhone?: string;
  companyTitle?: string;
}

export interface CustomInvoiceSendDto {
  invoiceId: string;
  email?: string;
  // for frontend conditions purposes
  testing?: boolean;
}

export interface InvoicePayNow {
  invoiceId: string;
}
