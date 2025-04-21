import { AppResponse } from "JS/types/Response";
import { WithValidityState } from "JS/types";
import { BaseService } from "../BaseService";
import {
  CreateInvoiceDto,
  CustomInvoiceSendDto,
} from "JS/typingForNow/Invoice";
import { Invoice, InvoiceDto } from "JS/typingForNow/Invoice";

export class InvoiceService extends BaseService {
  getInvoicesByClientId(
    clientId: string
  ): Promise<WithValidityState<AppResponse<InvoiceDto[]>>> {
    return this.doServerXHR<InvoiceDto[]>({
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
    data: CreateInvoiceDto,
    files?: FileList
  ): Promise<WithValidityState<AppResponse<InvoiceDto>>> {
    const formData = new FormData();

    // Convert entire data object to JSON string and append as "invoiceData"
    formData.append("invoiceData", JSON.stringify(data));

    // Append multiple files if present
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
    }

    return this.doServerXHR<InvoiceDto>({
      url: this.activeRoute().server.api.invoice.create(),
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  deleteInvoice(
    dbInvoiceId: string
  ): Promise<WithValidityState<AppResponse<boolean>>> {
    return this.doServerXHR<boolean>({
      url: this.activeRoute().server.api.invoice.delete(dbInvoiceId),
      method: "DELETE",
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
    data: CustomInvoiceSendDto
  ): Promise<WithValidityState<AppResponse<boolean>>> {
    const { testing, invoiceId } = data;

    return this.doServerXHR<boolean>({
      url: testing
        ? this.activeRoute().server.api.invoice.sendInvoiceEmailToClientTesting(
            invoiceId
          )
        : this.activeRoute().server.api.invoice.sendInvoiceEmailToClient(
            invoiceId
          ),
      method: "POST",
      data: {},
    });
  }
}
