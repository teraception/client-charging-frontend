import { AppResponse } from "JS/types/Response";
import { WithValidityState } from "JS/types";
import { BaseService } from "../BaseService";
import {
  CreateInvoiceDto,
  Invoice,
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
    invoiceId: string
  ): Promise<WithValidityState<AppResponse<boolean>>> {
    return this.doServerXHR<boolean>({
      url: this.activeRoute().server.api.invoice.delete(invoiceId),
      method: "DELETE",
    });
  }
}
