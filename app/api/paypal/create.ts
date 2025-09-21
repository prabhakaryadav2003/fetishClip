import type { NextApiRequest, NextApiResponse } from "next";
import { createPayPalPlan } from "@/lib/payments/createPlan";
import { savePlanToDB } from "@/lib/db/queries";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, description, price, productId } = req.body;
  try {
    const paypalPlanId = await createPayPalPlan(
      name,
      description,
      price,
      productId
    );
    await savePlanToDB({ name, description, paypalPlanId, price });
    res.status(200).json({ success: true, paypalPlanId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Plan creation failed" });
  }
}
