"use client";
import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

type CartItem = { id: string; quantity: number };

interface PayPalCheckoutProps {
  cart: CartItem[];
}

export default function PayPalCheckout({ cart }: PayPalCheckoutProps) {
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
