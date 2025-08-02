import type { NextApiRequest, NextApiResponse } from "next";
import { payPalClient } from "@/lib/payments/paypalClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { planId } = req.body;

  const request =
    new (require("@paypal/checkout-server-sdk").subscriptions.SubscriptionsCreateRequest)();
  request.requestBody({
    plan_id: planId,
    application_context: {
      brand_name: "fetishClip",
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/cancel`,
    },
  });

  try {
    const response = await payPalClient().execute(request);
    const approvalUrl = response.result.links.find(
      (l: any) => l.rel === "approve"
    )?.href;

    res.status(200).json({ subscriptionId: response.result.id, approvalUrl });
  } catch (err) {
    console.error("Error creating subscription:", err);
    res.status(500).json({ error: "Failed to create subscription" });
  }
}
