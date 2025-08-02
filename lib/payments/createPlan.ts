import { payPalClient } from "@/lib/payments/paypalClient";

export async function createPayPalPlan(
  name: string,
  description: string,
  price: string,
  productId: string
) {
  const request = {
    path: "/v1/billing/plans",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      product_id: productId,
      name,
      description,
      billing_cycles: [
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: price,
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    },
  };

  const res = await payPalClient().execute(request);
  return res.result.id;
}
