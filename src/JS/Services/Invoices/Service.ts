import { AppResponse } from "JS/types/Response";
import { WithValidityState } from "JS/types";
import { BaseService } from "../BaseService";
import {
  CreateInvoiceDto,
  Invoice,
  InvoicePayNow,
  StripeCustomInvoiceSendDto,
  StripeInvoiceObj,
} from "JS/typingForNow/types";

export class InvoiceService extends BaseService {
  getInvoicesByClientId(
    clientId: string
  ): Promise<WithValidityState<AppResponse<StripeInvoiceObj[]>>> {
    return this.doServerXHR<StripeInvoiceObj[]>({
      url: this.activeRoute().server.api.invoice.getInvoiceByClientId(clientId),
      method: "GET",
    });
  }

  getInvoiceDetails(
    invoiceId: string
  ): Promise<WithValidityState<AppResponse<Invoice>>> {
    return this.doServerXHR<Invoice>({
      url: this.activeRoute().server.api.invoice.getInvoice(invoiceId),
      method: "GET",
    });
  }

  createInvoice(
    data: CreateInvoiceDto
  ): Promise<WithValidityState<AppResponse<StripeInvoiceObj>>> {
    return this.doServerXHR<StripeInvoiceObj>({
      url: this.activeRoute().server.api.invoice.create(),
      method: "POST",
      data,
    });
  }

  deleteInvoice(
    invoiceId: string,
    dbInvoiceId: string
  ): Promise<WithValidityState<AppResponse<boolean>>> {
    return this.doServerXHR<boolean>({
      url: this.activeRoute().server.api.invoice.delete(dbInvoiceId),
      method: "DELETE",
      data: { invoiceId },
    });
  }

  payInvoiceNow(
    invoiceId: string
  ): Promise<WithValidityState<AppResponse<boolean>>> {
    return this.doServerXHR<boolean>({
      url: this.activeRoute().server.api.invoice.payNow(invoiceId),
      method: "POST",
      data: {},
    });
  }

  sendInvoiceEmailToClient(
    invoiceId: string,
    data: StripeCustomInvoiceSendDto
  ): Promise<WithValidityState<AppResponse<boolean>>> {
    return this.doServerXHR<boolean>({
      url: data.testing
        ? this.activeRoute().server.api.invoice.sendInvoiceEmailToClientTesting(
            invoiceId
          )
        : this.activeRoute().server.api.invoice.sendInvoiceEmailToClient(
            invoiceId
          ),
      method: "POST",
      data,
    });
  }
}
