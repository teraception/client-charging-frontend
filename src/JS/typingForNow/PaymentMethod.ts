import { PaymentMethod as StripePaymentMethodType } from "@stripe/stripe-js";

/**
 * Types for consistent payment method display
 */
export interface PaymentMethodDisplay {
  label: string;
  color:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning"
    | "default";
  iconType: "card" | "bank" | "wallet" | "apple" | "google" | "link";
}

/**
 * Payment method mappers to display labels based on payment method type
 */
export const paymentMethodMapper = {
  card: (paymentMethod: StripePaymentMethodType): PaymentMethodDisplay => {
    if (paymentMethod.card) {
      const { brand, last4 } = paymentMethod.card;
      const label = `${brand?.toUpperCase() || "CARD"} **** ${last4 || "****"}`;

      // Set color based on card brand
      let color: PaymentMethodDisplay["color"] = "default";
      let iconType: PaymentMethodDisplay["iconType"] = "card";

      // Handle brand-specific styling
      if (brand === "visa") {
        color = "primary";
      } else if (brand === "mastercard") {
        color = "warning";
      } else if (brand === "amex") {
        color = "info";
      }

      // Handle wallet cases
      if (paymentMethod.card.wallet) {
        if (paymentMethod.card.wallet.type === "apple_pay") {
          iconType = "apple";
          color = "primary";
        } else if (paymentMethod.card.wallet.type === "google_pay") {
          iconType = "google";
          color = "secondary";
        } else {
          iconType = "wallet";
          color = "success";
        }
      }

      return { label, color, iconType };
    }
    return { label: "Card", color: "default", iconType: "card" };
  },

  us_bank_account: (
    paymentMethod: StripePaymentMethodType
  ): PaymentMethodDisplay => {
    if (paymentMethod.us_bank_account) {
      const { bank_name, last4 } = paymentMethod.us_bank_account;
      const label = `${bank_name || "BANK"} **** ${last4 || "****"}`;
      return { label, color: "warning", iconType: "bank" };
    }
    return { label: "Bank Account", color: "warning", iconType: "bank" };
  },

  link: (paymentMethod: StripePaymentMethodType): PaymentMethodDisplay => {
    return { label: "Link", color: "info", iconType: "link" };
  },

  apple_pay: (paymentMethod: StripePaymentMethodType): PaymentMethodDisplay => {
    return { label: "Apple Pay", color: "primary", iconType: "apple" };
  },

  google_pay: (
    paymentMethod: StripePaymentMethodType
  ): PaymentMethodDisplay => {
    return { label: "Google Pay", color: "secondary", iconType: "google" };
  },

  // Default mapper for unknown types
  default: (paymentMethod: StripePaymentMethodType): PaymentMethodDisplay => {
    return {
      label: paymentMethod.type?.toUpperCase() || "Unknown Payment Method",
      color: "default",
      iconType: "card",
    };
  },
};

/**
 * Gets the formatted display details for a payment method
 */
export const getPaymentMethodDisplay = (
  paymentMethod: StripePaymentMethodType
): PaymentMethodDisplay => {
  if (!paymentMethod) return { label: "", color: "default", iconType: "card" };

  const mapper = paymentMethod.type
    ? paymentMethodMapper[paymentMethod.type]
    : null;
  return mapper
    ? mapper(paymentMethod)
    : paymentMethodMapper.default(paymentMethod);
};

/**
 * Gets just the label for a payment method (for backward compatibility)
 */
export const getPaymentMethodLabel = (
  paymentMethod: StripePaymentMethodType
): string => {
  return getPaymentMethodDisplay(paymentMethod).label;
};
