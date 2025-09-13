export type PayPalEventType =
  | "BILLING.SUBSCRIPTION.ACTIVATED"
  | "CHECKOUT.ORDER.CAPTURED"
  | "PAYMENT.CAPTURE.COMPLETED";

export interface PayPalSubscriber {
  payer_id?: string;
  email_address?: string;
}

export interface PayPalSubscriptionResource {
  id: string;
  plan_id: string;
  start_time: string;
  subscriber?: PayPalSubscriber;
}

export interface PayPalOrderResource {
  id: string;
  payer?: PayPalSubscriber;
}

export interface PayPalWebhookEventBase<T extends PayPalEventType, R> {
  id: string;
  event_type: T;
  resource: R;
  // other PayPal fields can be added here if needed
}

export type PayPalWebhookEvent =
  | PayPalWebhookEventBase<
      "BILLING.SUBSCRIPTION.ACTIVATED",
      PayPalSubscriptionResource
    >
  | PayPalWebhookEventBase<"CHECKOUT.ORDER.CAPTURED", PayPalOrderResource>
  | PayPalWebhookEventBase<"PAYMENT.CAPTURE.COMPLETED", PayPalOrderResource>;
