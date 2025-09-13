// pages/api/paypal/create.ts (or app/api/paypal/create/route.ts)
import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/payments/paypal";

export async function POST(req: NextRequest) {
  try {
    const { cart } = await req.json();
    const { id: orderID } = await createOrder(cart);
    return NextResponse.json({ orderID: orderID });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 }
    );
  }
}
