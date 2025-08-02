import { payPalClient } from "./paypalClient";

interface CreateProductOptions {
  name: string;
  description?: string;
  type?: "SERVICE" | "PHYSICAL";
  category?: string;
}

export async function createPayPalProduct({
  name,
  description = "Subscription for video content",
  type = "SERVICE",
  category = "SOFTWARE",
}: CreateProductOptions): Promise<string> {
  const request = {
    path: "/v1/catalogs/products",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      name,
      description,
      type,
      category,
    },
  };

  const client = payPalClient();

  const response = await client.execute(request);
  return response.result.id;
}
