import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { CONFIRM_ORDER, CONFIRM_JOB_PAYMENT } from "../utils/constants";

export default function CheckoutForm({ onPaymentSuccess, amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cookies] = useCookies();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [elementsReady, setElementsReady] = useState(false);

  useEffect(() => {
    if (!stripe) {
      console.log("Stripe not loaded yet");
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    console.log("Client secret from URL:", clientSecret);

    if (!clientSecret) {
      console.log("No client secret found in URL");
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent, error }) => {
      if (error) {
        console.error("Error retrieving payment intent:", error);
        setMessage("Error retrieving payment information.");
        return;
      }

      console.log("Payment intent status:", paymentIntent.status);

      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          toast.success("Payment succeeded!");
          // Call your backend to confirm the order
          confirmOrderOnBackend(paymentIntent.id);
          break;
        case "processing":
          setMessage("Your payment is processing.");
          toast.info("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          toast.error("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          toast.error("Something went wrong.");
          break;
      }
    }).catch((err) => {
      console.error("Error in retrievePaymentIntent:", err);
      setMessage("Error retrieving payment information.");
    });
  }, [stripe]);

  const confirmOrderOnBackend = async (paymentIntentId) => {
    try {
      console.log("Confirming order with payment intent:", paymentIntentId);
      console.log("Using JWT token:", cookies.jwt ? "Present" : "Missing");
      
      // Determine if this is a job payment or gig order
      const isJobPayment = onPaymentSuccess !== undefined;
      const apiUrl = isJobPayment ? CONFIRM_JOB_PAYMENT : CONFIRM_ORDER;
      
      console.log("API URL:", apiUrl);
      console.log("Is job payment:", isJobPayment);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cookies.jwt}`,
        },
        body: JSON.stringify({
          paymentIntent: paymentIntentId,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        console.log("Payment confirmed on backend:", data);
        toast.success("Payment confirmed successfully!");
        
        // Call the success callback if provided (for job payments)
        if (onPaymentSuccess) {
          onPaymentSuccess(paymentIntentId);
        }
      } else {
        console.error("Error confirming payment:", data);
        toast.error(data.error || "Failed to confirm payment");
      }
    } catch (error) {
      console.error("Error calling confirm payment API:", error);
      toast.error("Failed to confirm payment");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.log("Stripe or elements not loaded");
      toast.error("Payment system not ready. Please wait and try again.");
      return;
    }

    if (!elementsReady) {
      console.log("Elements not ready");
      toast.error("Payment form not ready. Please wait and try again.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // First validate the form
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("Form validation error:", submitError);
        setMessage(submitError.message);
        toast.error(submitError.message);
        setIsLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Payment confirmation error:", error);
        
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message);
          toast.error(error.message);
        } else {
          setMessage("An unexpected error occurred: " + error.message);
          toast.error("An unexpected error occurred.");
        }
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("Payment succeeded:", paymentIntent);
        console.log("Payment intent ID:", paymentIntent.id);
        console.log("Payment intent status:", paymentIntent.status);
        setMessage("Payment succeeded!");
        toast.success("Payment succeeded!");
        
        await confirmOrderOnBackend(paymentIntent.id);
        
        // Only redirect to success page for gig orders, not job payments
        if (!onPaymentSuccess) {
          window.location.href = "/success";
        }
      } else {
        console.log("Payment intent status:", paymentIntent?.status);
        console.log("Payment intent:", paymentIntent);
      }
    } catch (err) {
      console.error("Unexpected error during payment:", err);
      setMessage("An unexpected error occurred: " + err.message);
      toast.error("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
  };

  const handlePaymentElementReady = () => {
    console.log("Payment element is ready");
    setElementsReady(true);
  };

  const handlePaymentElementError = (error) => {
    console.error("Payment element error:", error);
    setMessage("Payment form failed to load. Please refresh the page.");
    toast.error("Payment form failed to load. Please refresh the page.");
  };

  // Fixed: Handle LinkAuthenticationElement onChange correctly
  const handleLinkAuthenticationChange = (event) => {
    console.log("Link authentication change:", event);
    // The event object from LinkAuthenticationElement has the email in event.value.email
    if (event && event.value && event.value.email) {
      setEmail(event.value.email);
    }
  };

  return (
    <div className="w-96">
      {!stripe || !elements ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1DBF73] mr-2"></div>
          Loading payment form...
        </div>
      ) : (
        <form id="payment-form" onSubmit={handleSubmit}>
          <LinkAuthenticationElement
            id="link-authentication-element"
            onChange={handleLinkAuthenticationChange}
            onReady={() => console.log("Link authentication element ready")}
            onError={(error) => console.error("Link authentication error:", error)}
          />
          <PaymentElement 
            id="payment-element" 
            options={paymentElementOptions}
            onReady={handlePaymentElementReady}
            onError={handlePaymentElementError}
          />
          <button
            disabled={isLoading || !stripe || !elements || !elementsReady}
            id="submit"
            className="border text-lg font-semibold px-5 py-3 border-[#1DBF73] bg-[#1DBF73] 
            hover:bg-green-500 text-white rounded-md my-5 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span id="button-text">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : !elementsReady ? (
                "Loading..."
              ) : (
                "Pay now"
              )}
            </span>
          </button>
        </form>
      )}
      
      {/* Show any error or success messages */}
      {message && (
        <div 
          id="payment-message" 
          className={`mt-4 p-3 rounded ${
            message.includes("succeeded") 
              ? "bg-green-100 text-green-700 border border-green-300" 
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}