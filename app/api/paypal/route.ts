import { getAllPlans } from "@/lib/db/queries";

export async function GET() {
  const plans = await getAllPlans();
  return Response.json(plans);
}
