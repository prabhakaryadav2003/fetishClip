// pages/api/paypal/[orderID]/capture.ts
import { NextRequest, NextResponse } from "next/server";
import { captureOrder } from "@/lib/paypal";

export async function POST(
  req: NextRequest,
  { params }: { params: { orderID: string } }
) {
  try {
    const { orderID } = params;
    const result = await captureOrder(orderID);
    return NextResponse.json(result.jsonResponse);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to capture order." },
      { status: 500 }
    );
  }
}
