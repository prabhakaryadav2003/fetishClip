import { NextRequest, NextResponse } from "next/server";
import { captureOrder } from "@/lib/payments/paypal";

// Use params as optional, possibly async, to satisfy Next.js internal checker
export async function POST(
  req: NextRequest,
  ctx: {
    params: Promise<{ orderID: string }>;
  }
) {
  // normalize params
  const resolvedParams = await ctx.params;
  const orderID = Array.isArray(resolvedParams?.orderID)
    ? resolvedParams.orderID[0]
    : resolvedParams?.orderID;

  if (!orderID) {
    return NextResponse.json({ error: "Missing order ID." }, { status: 400 });
  }

  try {
    const result = await captureOrder(orderID);
    return NextResponse.json(result.jsonResponse);
  } catch (err) {
    console.error("PayPal capture failed:", err);
    return NextResponse.json(
      { error: "Failed to capture order." },
      { status: 500 }
    );
  }
}
