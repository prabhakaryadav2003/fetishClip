import type { NextApiRequest, NextApiResponse } from "next";
import { verifyPaypalWebhook } from "./verifyWebhook";
import { updateSubscription } from "@/lib/db/queries";
import { updateOrderStatus } from "@/lib/db/orders";
import type { PayPalWebhookEvent } from "@/types/paypal";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const isValid = await verifyPaypalWebhook(
    req.headers as Record<string, string>,
    req.body
  );

  if (!isValid) {
    console.warn("Invalid PayPal webhook signature (or dev mode)");
    // return res.status(400).json({ error: "Invalid signature" });
  }

  const event = req.body as PayPalWebhookEvent;

  switch (event.event_type) {
    case "BILLING.SUBSCRIPTION.ACTIVATED": {
      const { id, plan_id, start_time, subscriber } = event.resource;
      const userId = Number(subscriber?.payer_id ?? "unknown");

      const err = await updateSubscription({
        userId,
        paypalSubscriptionId: id,
        paypalPlanId: plan_id,
        startTime: start_time,
      }).catch((e: unknown) => e);

      if (err instanceof Error) {
        console.error("Failed to store subscription:", err);
        return res.status(500).json({ error: "Failed to store subscription" });
      }

      return res.status(200).send("OK");
    }

    case "CHECKOUT.ORDER.CAPTURED":
    case "PAYMENT.CAPTURE.COMPLETED": {
      const orderId = event.resource.id;
      const payerId = event.resource.payer?.payer_id;

      const err = await updateOrderStatus(orderId, "completed", payerId).catch(
        (e: unknown) => e
      );

      if (err instanceof Error) {
        console.error("Failed to update order status:", err);
        return res.status(500).json({ error: "Failed to update order status" });
      }

      console.log(`Order ${orderId} marked as completed for payer ${payerId}`);
      return res.status(200).send("OK");
    }

    default:
      console.log(`Unhandled PayPal webhook event`);
      return res.status(200).send("OK");
  }
}
