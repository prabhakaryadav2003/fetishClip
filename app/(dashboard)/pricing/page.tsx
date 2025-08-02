"use client";

import { useEffect, useState } from "react";
import SubscribeButton from "./subscribeButton";

// function PricingCard({
//   name,
//   price,
//   interval,
//   trialDays,
//   features,
//   planId,
// }: {
//   name: string;
//   price: number;
//   interval: string;
//   trialDays: number;
//   features: string[];
//   planId: string;
// }) {
//   return (
//
//   );
// }

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
            <SubscribeButton paypalPlanId={plan.paypalPlanId} />
          </div>
        </div>
      ))}
    </div>
  );
}
