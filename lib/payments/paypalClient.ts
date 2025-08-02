import paypal from "@paypal/checkout-server-sdk";

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  return process.env.NODE_ENV === "production"
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

export function payPalClient() {
  return new paypal.core.PayPalHttpClient(environment());
}
