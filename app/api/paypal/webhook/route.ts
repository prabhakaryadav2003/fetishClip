import type { NextApiRequest, NextApiResponse } from "next";
import { verifyPaypalWebhook } from "./verifyWebhook";
import { updateSubscription } from "@/lib/db/queries";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const isValid = await verifyPaypalWebhook(
    req.headers as Record<string, string>,
    req.body
  );

  if (!isValid) {
    console.warn("Using Dev Server");
    // return res.status(400).json({ error: "Invalid PayPal webhook signature" });
  }

  const event = req.body;

  if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
    const { id, plan_id, start_time, subscriber } = event.resource;
    const userId = subscriber?.payer_id ?? "unknown";

    try {
      await updateSubscription({
        userId,
        paypalSubscriptionId: id,
        paypalPlanId: plan_id,
        startTime: start_time,
      });
    } catch (err) {
      console.error("Failed to store subscription:", err);
      return res.status(500).json({ error: "Failed to store subscription" });
    }
  }

  res.status(200).send("OK");
}
