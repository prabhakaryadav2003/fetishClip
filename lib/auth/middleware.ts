import { z } from "zod";
import {
  getUser,
  getAllVideos,
  getVideosByCreator,
  getVideoById,
  insertVideo,
  deleteVideo,
} from "@/lib/db/queries";
import { redirect } from "next/navigation";
import type { User } from "@/lib/db/schema";

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

// Check if a user is a creator
export function isCreator(user: User) {
  return user.role === "creator" || user.role === "admin";
}

// Check if a user has an active subscription
export function isActiveSubscriber(user: User) {
  return user.subscriptionStatus === "active";
}

// List all videos (for public or active subscriber)
export async function listAllVideosAction() {
  const user = await getUser();
  if (!user || !isActiveSubscriber(user)) redirect("/subscribe");
  return getAllVideos();
}

// List uploaded videos (for creators)
export async function listMyVideosAction() {
  const user = await getUser();
  if (!user || !isCreator(user)) redirect("/not-authorized");
  return getVideosByCreator(user.id);
}

// Add video
export async function addVideoAction(data: {
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
}) {
  const user = await getUser();
  if (!user || !isCreator(user)) redirect("/not-authorized");
  await insertVideo({ ...data, uploaderId: user.id });
}

// Delete video
export async function deleteVideoAction(videoId: string) {
  const user = await getUser();
  const video = await getVideoById(videoId);
  if (!video) throw new Error("Video not found");
  if (!user || (video.uploaderId !== user.id && user.role !== "admin"))
    redirect("/not-authorized");
  await deleteVideo(videoId);
}

// Watch video
export async function watchVideoAction(videoId: string) {
  const user = await getUser();
  if (!user || !isActiveSubscriber(user)) redirect("/subscribe");
  const video = await getVideoById(videoId);
  if (!video) throw new Error("Video not found");
  // (log the watch event here)
  return video;
}
