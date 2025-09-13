import paypal from "@paypal/checkout-server-sdk";

import { payPalClient } from "@/lib/payments/paypalClient";

export const PRODUCTS = {
  "Monthly Plan": { name: "monthly", price: 9.99 },
  "Annual Plan": { name: "yearly", price: 99.99 },
};

export type ProductId = keyof typeof PRODUCTS;

export async function createOrder(cart: { id: ProductId; quantity: number }[]) {
  const items = cart.map((item) => {
    const product = PRODUCTS[item.id];
    return {
      name: product.name,
      quantity: item.quantity.toString(),
      unit_amount: {
        currency_code: "USD",
        value: product.price.toFixed(2),
      },
    };
  });

  const total = items.reduce(
    (sum, item) => sum + Number(item.unit_amount.value) * Number(item.quantity),
    0
  );

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=minimal");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: total.toFixed(2),
            },
          },
        },
        items,
      },
    ],
  });

  const response = await payPalClient().execute(request);
  return {
    id: response.result.id,
    httpStatusCode: response.statusCode,
  };
}

export async function captureOrder(orderID: string) {
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  const response = await payPalClient().execute(request);
  return {
    jsonResponse: response.result,
    httpStatusCode: response.statusCode,
  };
}
