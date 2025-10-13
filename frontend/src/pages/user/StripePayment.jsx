import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { payment } from "../../api/stripe";
import useEcomStore from "../../store/ecomStore";
import CheckoutFrom from "../../components/CheckoutFrom";

const stripePromise = loadStripe("pk_test_51SCj31AcH4hYGliPG6F9jr9yUNINhP1Sa70umALP6D0aFM1KMoelKirtAkqRSPZunaLPSgdQQzL3sEfxee37LwRF00ixT9LC5c");

const StripePayment = () => {
  const token = useEcomStore((state) => state.token);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (token) {
      payment(token)
        .then((res) => setClientSecret(res.data.clientSecret))
        .catch(console.error);
    }
  }, [token]);

  const appearance = { theme: "stripe" };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {clientSecret && (
        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
          <CheckoutFrom />
        </Elements>
      )}
    </div>
  );
};

export default StripePayment;
