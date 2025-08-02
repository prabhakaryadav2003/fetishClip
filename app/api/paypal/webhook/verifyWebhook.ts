import {
  PayPalHttpClient,
  LiveEnvironment,
  SandboxEnvironment,
  WebhookEventVerifyRequest,
} from "@paypal/checkout-server-sdk";

function client() {
  const env =
    process.env.NODE_ENV === "production"
      ? new LiveEnvironment(
          process.env.PAYPAL_CLIENT_ID!,
          process.env.PAYPAL_CLIENT_SECRET!
        )
      : new SandboxEnvironment(
          process.env.PAYPAL_CLIENT_ID!,
          process.env.PAYPAL_CLIENT_SECRET!
        );

  return new PayPalHttpClient(env);
}

export async function verifyPaypalWebhook(
  headers: Record<string, string>,
  body: any
): Promise<boolean> {
  const transmissionId = headers["paypal-transmission-id"];
  const timestamp = headers["paypal-transmission-time"];
  const signature = headers["paypal-transmission-sig"];
  const certUrl = headers["paypal-cert-url"];
  const authAlgo = headers["paypal-auth-algo"];
  const webhookId = process.env.PAYPAL_WEBHOOK_ID!; // from your PayPal app

  const verifyReq = new WebhookEventVerifyRequest();
  verifyReq.requestBody({
    transmission_id: transmissionId,
    transmission_time: timestamp,
    cert_url: certUrl,
    auth_algo: authAlgo,
    transmission_sig: signature,
    webhook_id: webhookId,
    webhook_event: body,
  });

  try {
    const response = await client().execute(verifyReq);
    return response.result.verification_status === "SUCCESS";
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return false;
  }
}
