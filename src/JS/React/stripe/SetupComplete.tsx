import { useEffect, useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";

export const PaymentSetupComplete = () => {
  const stripe = useStripe();
  const [status, setStatus] = useState<"processing" | "succeeded" | "failed">(
    "processing"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the "setup_intent" query parameter
    const clientSecret = new URLSearchParams(window.location.search).get(
      "setup_intent_client_secret"
    );

    if (clientSecret) {
      stripe
        .retrieveSetupIntent(clientSecret)
        .then(({ setupIntent }) => {
          switch (setupIntent?.status) {
            case "succeeded":
              setStatus("succeeded");
              setMessage("Your payment method has been successfully set up!");
              break;
            case "processing":
              setStatus("processing");
              setMessage("Your payment method is being processed.");
              break;
            default:
              setStatus("failed");
              setMessage("Something went wrong.");
              break;
          }
        })
        .catch((err) => {
          setStatus("failed");
          setMessage("An error occurred while retrieving your setup intent.");
          console.error("Error:", err);
        });
    }
  }, [stripe]);

  return (
    <div className="status-container">
      <div className="status-card">
        <h1 className="status-title">
          Payment Setup {status === "succeeded" ? "Complete" : "Status"}
        </h1>

        {status === "processing" && <div className="spinner"></div>}

        {status === "succeeded" && (
          <div className="success-icon">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
        )}

        {status === "failed" && (
          <div className="error-icon">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
        )}

        <p className="status-message">{message}</p>

        <button
          onClick={() => (window.location.href = "/")}
          className="return-button"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};
