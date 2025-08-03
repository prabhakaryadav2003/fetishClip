"use client";

import { useState } from "react";

export default function SubscribeButton({
  paypalPlanId,
}: {
  paypalPlanId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: paypalPlanId }),
    });
    const data = await res.json();

    if (data.approvalUrl) {
      window.location.href = data.approvalUrl; // redirect to PayPal
    } else {
      alert("Subscription failed");
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full bg-red-500 text-white text-sm font-medium py-2 px-4 rounded-xl hover:bg-red-700 hover:scale-102 transition duration-200"
    >
      {loading ? "Redirecting..." : "Subscribe with PayPal"}
    </button>
  );
}
