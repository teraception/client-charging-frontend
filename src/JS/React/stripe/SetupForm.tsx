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
import { config } from "JS/Config";
import { CreatePaymentMethodDto } from "JS/typingForNow/types";
import { localStorageKeys } from "JS/types/constants";

const dashboardUrl = config.dashboardUrl;

interface Props {
  forProject: boolean;
  payload: CreatePaymentMethodDto | null;
}

export const PaymentSetupForm = (props: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const { id: routeClientId } = useParams();

  const { forProject, payload } = props;

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
      clientId: forProject ? payload?.clientId : routeClientId,
      projectId: forProject ? payload?.projectId : undefined,
    });

    // Confirm the SetupIntent using the details collected by the Payment Element

    if (forProject) {
      localStorage.setItem(
        localStorageKeys.paymentMethodForProject,
        payload.projectId
      );
    }
    const { error } = await stripe.confirmSetup({
      elements: elements as StripeElements,
      clientSecret: res.data.clientSecret,
      confirmParams: {
        return_url: forProject
          ? `${dashboardUrl}/clients/${routeClientId}/projects`
          : `${dashboardUrl}/clients/${routeClientId}/payment-methods`,
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
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "500px",
        margin: "0 auto",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow:
          "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        backgroundColor: "#fff",
      }}
      className="form-container"
    >
      <h2
        style={{
          fontSize: "1.5rem",
          marginBottom: "1.5rem",
          color: "#4D4F5C",
          textAlign: "center",
          fontWeight: "600",
        }}
        className="form-title"
      >
        Set Up Payment Method
      </h2>
      <div style={{ marginBottom: "1.5rem" }}>
        <PaymentElement />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading || createPaymentMethodLoader}
        style={{
          width: "100%",
          padding: "0.75rem 1rem",
          backgroundColor:
            !stripe || loading || createPaymentMethodLoader
              ? "#949494"
              : "#00A8A3",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "1rem",
          fontWeight: "500",
          cursor:
            !stripe || loading || createPaymentMethodLoader
              ? "not-allowed"
              : "pointer",
          transition: "background-color 0.2s ease-in-out",
          marginTop: "0.5rem",
        }}
        className="submit-button"
      >
        {loading || createPaymentMethodLoader ? "Processing..." : "Submit"}
      </button>
      {errorMessage && (
        <div
          style={{
            color: "#f65c5c",
            marginTop: "1rem",
            padding: "0.75rem",
            backgroundColor: "#dff9ed",
            borderRadius: "4px",
            fontSize: "0.875rem",
          }}
        >
          {errorMessage}
        </div>
      )}
    </form>
  );
};
