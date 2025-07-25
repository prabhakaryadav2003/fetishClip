"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { customerPortalAction } from "@/lib/payments/actions";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  // Get current user info
  const { data: user, isLoading } = useSWR("/api/user", fetcher);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // Personal subscription status
  const planName = user.planName || "Free";
  const status = user.subscriptionStatus || "none";

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">
        Subscription Settings
      </h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>My Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="font-medium">Current Plan: {planName}</p>
            <p className="text-sm text-muted-foreground">
              {status === "active"
                ? "Billed monthly"
                : status === "trialing"
                  ? "Trial period"
                  : "No active subscription"}
            </p>
            <form action={customerPortalAction} className="mt-4 flex">
              <Button type="submit" variant="outline">
                Manage Billing
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <span className="text-muted-foreground text-sm">Name</span>
            <div className="font-medium">{user.name || "-"}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-sm">Email</span>
            <div className="font-medium">{user.email}</div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
