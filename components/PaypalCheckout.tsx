"use client";
import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Renders errors or successfull transactions on the screen.
function Message({ content }: { content: string }) {
  return <p>{content}</p>;
}

type CartItem = { id: string; quantity: number };

interface PayPalCheckoutProps {
  cart: CartItem[];
}

export default function PayPalCheckout({ cart }: { cart: CartItem[] }) {
  const [message, setMessage] = useState("");

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: "USD",
  };

  return (
    <div>
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
          }}
          createOrder={async (_, actions) => {
            const res = await fetch("/api/paypal/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cart }),
            });

            if (!res.ok) throw new Error("Failed to create PayPal order");

            const data: { orderID: string } = await res.json();

            if (!data.orderID)
              throw new Error("No orderID returned from server");

            // Return the orderID to PayPal
            return data.orderID;
          }}
          onApprove={async (data, actions) => {
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
              console.log("Capture result", orderData);
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

      {message && <div>{message}</div>}
    </div>
  );
}
