"use server";

import { redirect } from "next/navigation";
import { createCheckoutSession, createCustomerPortalSession } from "./stripe";
import { withActiveUser } from "@/lib/auth/middleware"; // use the user-centric helper!

export const checkoutAction = withActiveUser(async (formData, user) => {
  const priceId = formData.get("priceId") as string;
  await createCheckoutSession({ user, priceId }); // pass user, not team
});

// The portal typically redirects directly to Stripe billing portal
export const customerPortalAction = withActiveUser(async (_, user) => {
  const portalSession = await createCustomerPortalSession(user);
  redirect(portalSession.url);
});
