import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { PaymentSetupForm } from "./SetupForm";
import { config } from "JS/Config";

const stripePublishableKey = config.stripe.publishableKey;

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(stripePublishableKey);

export const StripeIndex = () => {
  const options = {
    mode: "setup",
    currency: "usd",
    // Fully customizable with appearance API.
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#3b82f6",
        colorBackground: "#ffffff",
        colorText: "#1f2937",
        colorDanger: "#ef4444",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        spacingUnit: "4px",
        borderRadius: "6px",
      },
    },
  } as StripeElementsOptions;

  return (
    <div className="status-container">
      <Elements stripe={stripePromise} options={options}>
        <PaymentSetupForm />
      </Elements>
    </div>
  );
};
