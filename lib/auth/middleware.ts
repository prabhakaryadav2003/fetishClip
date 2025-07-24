import { z } from "zod";
import { getUser } from "@/lib/db/queries";
import { redirect } from "next/navigation";

// --- Action state type ---
export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any;
};

type ValidatedActionFunction<S extends z.ZodTypeAny, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodTypeAny, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || "Invalid input." };
    }
    return action(parsed.data, formData);
  };
}

import type { User } from "@/lib/db/schema";

type ValidatedActionWithUserFunction<S extends z.ZodTypeAny, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodTypeAny, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const user = await getUser();
    if (!user || user.deletedAt) {
      redirect("/sign-in");
    }
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || "Invalid input." };
    }
    return action(parsed.data, formData, user);
  };
}

type ActionWithActiveUserFunction<T> = (
  formData: FormData,
  user: User
) => Promise<T>;

export function withActiveUser<T>(action: ActionWithActiveUserFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user || user.deletedAt) redirect("/sign-in");
    if (user.subscriptionStatus !== "active") {
      redirect("/subscribe");
    }
    return action(formData, user);
  };
}

type ValidatedActionWithActiveUserFunction<S extends z.ZodTypeAny, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

export function validatedActionWithActiveUser<S extends z.ZodTypeAny, T>(
  schema: S,
  action: ValidatedActionWithActiveUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const user = await getUser();
    if (!user || user.deletedAt) redirect("/sign-in");
    if (user.subscriptionStatus !== "active") redirect("/subscribe");
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || "Invalid input." };
    }
    return action(parsed.data, formData, user);
  };
}
