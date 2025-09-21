"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

type CartItem = { id: string; quantity: number };

interface PayPalCheckoutProps {
  cart: CartItem[];
}

function PayPalCheckout({ cart }: PayPalCheckoutProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: "USD",
  };

  return (
    <div>
      <PayPalScriptProvider options={initialOptions}>
        {loading && (
          <div className="flex justify-center items-center h-12">
            Loading ...
          </div>
        )}

        <PayPalButtons
          style={{
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
          }}
          onInit={() => {
            setLoading(false); // remove loader when button is ready
          }}
          createOrder={async () => {
            const res = await fetch("/api/paypal/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cart }),
            });

            if (!res.ok) throw new Error("Failed to create PayPal order");

            const data: { orderID: string } = await res.json();
            if (!data.orderID) throw new Error("No orderID returned");

            return data.orderID;
          }}
          onApprove={async (data) => {
            try {
              const res = await fetch(`/api/paypal/${data.orderID}/capture`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });

              const orderData = await res.json();
              const transaction =
                orderData.purchase_units[0].payments.captures[0];

              setMessage(
                `Transaction ${transaction.status}: ${transaction.id}`
              );
            } catch (error) {
              console.error(error);
              setMessage(`Transaction failed: ${error}`);
            }
          }}
          onError={(err) => {
            console.error("PayPal error:", err);
            setMessage(`PayPal Checkout failed: ${err}`);
          }}
        />
      </PayPalScriptProvider>

      {message && <div className="mt-4 text-sm text-gray-700">{message}</div>}
    </div>
  );
}

type Plan = {
  id: number;
  name: string;
  description: string;
  paypalPlanId: string;
  price: string;
};

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetch("/api/paypal")
      .then((res) => res.json())
      .then(setPlans);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-15 p-6 m-15">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="rounded-2xl border border-gray-200 bg-white shadow-md p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {plan.name}
            </h2>
            <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
            <p className="text-xl font-semibold text-primary">
              ${plan.price}/month
            </p>
          </div>

          <div className="mt-6">
            <PayPalCheckout cart={[{ id: plan.name, quantity: 1 }]} />
          </div>
        </div>
      ))}
    </div>
  );
}
