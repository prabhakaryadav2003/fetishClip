"use server";

import {
  createUser,
  deleteUser,
  updateUserAccount,
  getUser,
  getUserByEmail,
  changeUserPassword,
  insertActivityLog,
} from "@/lib/db/queries";
import { comparePasswords, hashPassword, setSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  validatedAction,
  validatedActionWithUser,
} from "@/lib/auth/middleware";
import { ActivityType, NewUser } from "@/lib/db/schema";

export async function logActivity(
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  await insertActivityLog({
    userId,
    action: type,
    ipAddress,
  });
}

// zod schema for validation
const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  url: z.string().min(1, "Url is required").max(255),
});

export async function updateAccount(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user || user.deletedAt) {
    return { error: "Not authenticated." };
  }

  const result = updateAccountSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0]?.message || "Invalid input." };
  }

  let { name, email, url } = result.data;

  if (url) {
    try {
      // Ensure URL is parseable
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

      const parsed = new URL(normalizedUrl);
      const hostname = parsed.hostname.toLowerCase();

      if (hostname !== "fetisheros.com" && hostname !== "www.fetisheros.com") {
        return { error: "This domain is not allowed." };
      }

      // Strip protocol before saving
      url = hostname + parsed.pathname + parsed.search + parsed.hash;
    } catch {
      return { error: "Invalid URL format." };
    }
  }

  await updateUserAccount(user.id, {
    name,
    email,
    url,
  });

  await logActivity(user.id, ActivityType.UPDATE_ACCOUNT);

  return { name, email, url, success: "Account updated successfully." };
}

// Sign In
const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const user = await getUserByEmail(email);
  if (!user) {
    return {
      error: "Invalid email or password. Please try again.",
      email,
      password,
    };
  }
  const isPasswordValid = await comparePasswords(password, user.passwordHash);
  if (!isPasswordValid) {
    return {
      error: "Invalid email or password. Please try again.",
      email,
      password,
    };
  }

  await Promise.all([
    setSession(user),
    logActivity(user.id, ActivityType.SIGN_IN),
  ]);

  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo === "checkout") {
    //integrate paypal further
    redirect("/404");
    // const priceId = formData.get("priceId") as string;
    // return createCheckoutSession({ user, priceId });
  }

  redirect("/dashboard");
});

// Sign Up
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["viewer", "creator"]).optional(),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, role = "viewer" } = data;

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return {
      error: "User with this email already exists.",
      email,
      password,
    };
  }

  const passwordHash = await hashPassword(password);

  // Insert the new user with role
  await createUser({
    email,
    passwordHash,
    role,
  });

  const newUser = await getUserByEmail(email);
  if (!newUser) {
    return {
      error: "Failed to create user. Please try again.",
      email,
      password,
    };
  }

  await Promise.all([
    logActivity(newUser.id, ActivityType.SIGN_UP),
    setSession({ id: newUser.id }),
  ]);

  // const redirectTo = formData.get("redirect") as string | null;
  // if (redirectTo === "checkout") {
  // redirect("/pricing");
  // }

  redirect("/dashboard");
});

// Sign Out
export async function signOut() {
  const user = await getUser();
  if (user) {
    await logActivity(user.id, ActivityType.SIGN_OUT);
    (await cookies()).delete("session");
  }
}

// Update Password
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;
    if (!(await comparePasswords(currentPassword, user.passwordHash))) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: "Current password is incorrect.",
      };
    }
    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: "New password must be different from the current password.",
      };
    }
    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: "New password and confirmation password do not match.",
      };
    }
    const newPasswordHash = await hashPassword(newPassword);
    await Promise.all([
      changeUserPassword(user.id, newPasswordHash),
      logActivity(user.id, ActivityType.UPDATE_PASSWORD),
    ]);
    return { success: "Password updated successfully." };
  }
);

// Delete Account
const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;
    if (!(await comparePasswords(password, user.passwordHash))) {
      return {
        password,
        error: "Incorrect password. Account deletion failed.",
      };
    }
    await logActivity(user.id, ActivityType.DELETE_ACCOUNT);
    await deleteUser(user.id);
    (await cookies()).delete("session");
    redirect("/sign-in");
  }
);
