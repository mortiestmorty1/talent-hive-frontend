import React, { useEffect, useState } from "react";
import { CREATE_ORDER } from "../utils/constants";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useStateProvider } from "../context/StateContext";

import CheckoutForm from "../components/CheckoutForm";
import axios from "axios";
import { toast } from "react-toastify";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const checkout = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cookies] = useCookies();
  const [{ isSeller, userInfo }] = useStateProvider();

  const router = useRouter();
  const { gigId } = router.query;

  useEffect(() => {
    // Check if user is a seller and prevent checkout
    if (isSeller) {
      toast.error('Sellers cannot purchase gigs. Please switch to Buyer mode.', {
        position: "top-center",
        autoClose: 3000,
      });
      router.push('/');
      return;
    }

    const createOrder = async () => {
      if (!gigId) {
        setError("No gig ID provided");
        return;
      }

      setLoading(true);
      setError("");
      
      try {
        console.log("Creating order for gigId:", gigId);
        console.log("Using CREATE_ORDER endpoint:", CREATE_ORDER);
        
        const { data } = await axios.post(
          CREATE_ORDER,
          { gigId },
          {
            headers: {
              Authorization: `Bearer ${cookies.jwt}`,
            },
          }
        );
        
        console.log("Order creation response:", data);
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          toast.success("Order created successfully");
        } else {
          setError("No client secret received from server");
        }
      } catch (err) {
        console.error("Order creation error:", err);
        console.error("Error response:", err.response?.data);
        setError(err.response?.data?.error || "Error creating order");
        toast.error("Error creating order");
      } finally {
        setLoading(false);
      }
    };

    if (gigId && !isSeller) {
      createOrder();
    }
  }, [gigId, cookies.jwt, isSeller, router]);

  const appearance = {
    theme: "stripe",
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-[80vh] max-w-full mx-20 flex flex-col gap-5 items-center ">
      <h1 className="text-3xl font-medium">Complete Your Order ! </h1>
      
      {loading && (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DBF73]"></div>
          <p className="text-gray-600">Creating your order...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <p className="text-red-800 font-medium">Error:</p>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}
      
      {!loading && !error && !clientSecret && (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DBF73]"></div>
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      )}
      
      {!loading && !error && clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
};

export default checkout;
