import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { StripeElements } from "@stripe/stripe-js";
import { useRouting } from "../Hooks/Routes";
import { useParams } from "react-router";
import { useCreatePaymentMethod } from "../Hooks/Payment-methods/Hook";

const returnUrl = import.meta.env.VITE_STRIPE_RETURN_URL;

export const PaymentSetupForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { id: routeClientId, projectId } = useParams();

  const {
    createPaymentMethod,
    createPaymentMethodResponse,
    createPaymentMethodLoader,
  } = useCreatePaymentMethod();

  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();

  const [errorMessage, setErrorMessage] = useState();
  const [loading, setLoading] = useState(false);

  const handleError = (error) => {
    setLoading(false);
    setErrorMessage(error.message);
  };

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements?.submit();
    if (submitError) {
      handleError(submitError);
      return;
    }

    // Create the SetupIntent and obtain clientSecret
    const res = await createPaymentMethod({
      clientId: routeClientId,
      projectId: projectId,
    });

    console.log("(^&)*B&tyhuxqc0iu", res, returnUrl);

    // Confirm the SetupIntent using the details collected by the Payment Element
    const { error } = await stripe.confirmSetup({
      elements: elements as StripeElements,
      clientSecret: res.data.clientSecret,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (error) {
      // This point is only reached if there's an immediate error when
      // confirming the setup. Show the error to your customer (for example, payment details incomplete)
      handleError(error);
    } else {
      // Your customer is redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer is redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
    setLoading(false);
  };
  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2 className="form-title">Set Up Payment Method</h2>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading || createPaymentMethodLoader}
        className="submit-button"
      >
        Submit
      </button>
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
};
