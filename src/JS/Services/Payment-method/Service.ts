import { AppResponse } from "JS/types/Response";
import { WithValidityState } from "JS/types";
import { BaseService } from "../BaseService";
import {
  CreatePaymentMethodDto,
  PaymentMethod,
  StripePaymentMethod,
} from "JS/typingForNow/types";

import { PaymentMethod as StripePaymentMethodType } from "@stripe/stripe-js";

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

  /**
   * Get all payment methods
   */
  getPaymentMethods(): Promise<
    WithValidityState<AppResponse<PaymentMethod[]>>
  > {
    return this.doServerXHR<PaymentMethod[]>({
      url: this.activeRoute().server.api.paymentMethod.getPaymentMethods(),
      method: "GET",
    });
  }

  /**
   * Get payment methods for a specific client
   */
  getClientPaymentMethods(
    clientId: string
  ): Promise<WithValidityState<AppResponse<StripePaymentMethod[]>>> {
    return this.doServerXHR<StripePaymentMethod[]>({
      url: this.activeRoute().server.api.paymentMethod.getClientPaymentMethods(
        clientId
      ),
      method: "GET",
    });
  }

  getStripePaymentMethodsByClientId(
    clientId: string
  ): Promise<WithValidityState<AppResponse<StripePaymentMethodType[]>>> {
    return this.doServerXHR<StripePaymentMethodType[]>({
      url: this.activeRoute().server.api.paymentMethod.getStripePaymentMethodsByClientId(
        clientId
      ),
    });
  }
}
