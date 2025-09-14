"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { updateAccount } from "@/app/(login)/actions";
import useSWR from "swr";

type ActionState = {
  name?: string;
  email?: string;
  fetisherosUrl?: string;
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function AccountForm({
  state,
  nameValue = "",
  emailValue = "",
  urlValue = "",
}: {
  state: ActionState;
  nameValue?: string;
  emailValue?: string;
  urlValue?: string;
}) {
  return (
    <>
      <div>
        <Label htmlFor="name" className="mb-2">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter your name"
          defaultValue={state.name ?? nameValue}
          required
        />
      </div>
      <div>
        <Label htmlFor="email" className="mb-2">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          defaultValue={state.email ?? emailValue}
          required
        />
      </div>
      <div>
        <Label htmlFor="url" className="mb-2">
          FetishEros URL
        </Label>
        <Input
          id="url"
          name="url"
          placeholder="Enter your fetisheros URL (e.g. www.fetisheros.com/yourname)"
          defaultValue={state.fetisherosUrl ?? urlValue}
          required
        />
      </div>
    </>
  );
}

export default function GeneralPage() {
  // SWR fetches the current user info for field pre-fill (cache key can be anything, e.g. '/api/user')
  const { data: user, isLoading } = useSWR("/api/user", fetcher);

  // useActionState lets you run async server actions for <form action={formAction}>
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    {}
  );

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        General Settings
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={formAction}>
            {isLoading ? (
              <div className="text-gray-400">Loading...</div>
            ) : (
              <AccountForm
                state={state}
                nameValue={user?.name ?? ""}
                emailValue={user?.email ?? ""}
                urlValue={user?.fetisherosUrl ?? ""}
              />
            )}
            {state.error && (
              <p className="text-red-500 text-sm">{state.error}</p>
            )}
            {state.success && (
              <p className="text-green-500 text-sm">{state.success}</p>
            )}
            <Button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
