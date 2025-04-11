import { AppResponse } from "JS/types/Response";
import { WithValidityState } from "JS/types";
import { BaseService } from "../BaseService";
import { CreatePaymentMethodDto, PaymentMethod } from "JS/typingForNow/types";

export class PaymentMethodService extends BaseService {
  createPaymentMethod(
    params: CreatePaymentMethodDto
  ): Promise<WithValidityState<AppResponse<{ clientSecret: string }>>> {
    return this.doServerXHR<{ clientSecret: string }>({
      url: this.activeRoute().server.api.paymentMethod.createPaymentMethod(),
      method: "POST",
      data: { ...params },
    });
  }
}
