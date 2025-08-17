import { desc, and, eq, isNull } from "drizzle-orm";
import { db } from "./drizzle";
import {
  activityLogs,
  users,
  videos,
  videoTags,
  plans,
  subscriptions,
} from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";

export async function deleteUser(userId: number) {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  await db
    .update(users)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
      email: `${user.email}-${user.id}-deleted`,
    })
    .where(eq(users.id, userId));

  await db.delete(videos).where(eq(videos.uploaderId, userId));
  await db.delete(activityLogs).where(eq(activityLogs.userId, userId));
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  role?: string;
}) {
  const { email, passwordHash, role = "viewer" } = data;
  return db.insert(users).values({
    email,
    passwordHash,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// Get the current authenticated user
export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie?.value) return null;

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }
  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }
  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);
  return user.length === 0 ? null : user[0];
}

export async function getUserById(userId: number) {
  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);
  return user.length === 0 ? null : user[0];
}

export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0] ?? null;
}

export async function changeUserPassword(
  userId: number,
  newPasswordHash: string
) {
  await db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// Update user's account information
export async function updateUserAccount(
  userId: number,
  data: { name?: string; email?: string }
) {
  const { name, email } = data;
  const updates: any = { updatedAt: new Date() };
  if (name) updates.name = name;
  if (email) updates.email = email;

  await db.update(users).set(updates).where(eq(users.id, userId));
}

// Update user's subscription fields
export async function updateUserSubscription(
  userId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(users)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// List all videos
export async function getAllVideos() {
  return db.select().from(videos).orderBy(desc(videos.createdAt));
}

// List videos from a specific creator
export async function getVideosByCreator(creatorId: number) {
  return db
    .select()
    .from(videos)
    .where(eq(videos.uploaderId, creatorId))
    .orderBy(desc(videos.createdAt));
}

export async function getVideoById(videoId: string) {
  const result = await db
    .select()
    .from(videos)
    .where(eq(videos.id, videoId))
    .limit(1);
  return result[0] ?? null;
}

export async function insertVideo(data: {
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  uploaderId: number;
  tags: string[];
}) {
  return db.transaction(async (tx) => {
    const [video] = await tx
      .insert(videos)
      .values({
        title: data.title,
        description: data.description,
        url: data.url,
        thumbnail: data.thumbnail,
        uploaderId: data.uploaderId,
      })
      .returning();

    if (data.tags?.length) {
      await tx.insert(videoTags).values(
        data.tags.map((tag) => ({
          videoId: video.id,
          tag,
        }))
      );
    }

    return video;
  });
}

// Update video and tags
export async function updateVideo(
  id: string, // UUID
  data: Partial<{
    title: string;
    description: string;
    thumbnail: string;
    tags: string[];
  }>
) {
  return db.transaction(async (tx) => {
    await tx
      .update(videos)
      .set({
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
      })
      .where(eq(videos.id, id));

    if (data.tags) {
      await tx.delete(videoTags).where(eq(videoTags.videoId, id));
      await tx.insert(videoTags).values(
        data.tags.map((tag) => ({
          videoId: id,
          tag,
        }))
      );
    }
  });
}

// Delete video and tags
export async function deleteVideo(id: string) {
  return db.transaction(async (tx) => {
    await tx.delete(videoTags).where(eq(videoTags.videoId, id));
    await tx.delete(videos).where(eq(videos.id, id));
  });
}

// Get activity logs for the current user
export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function insertActivityLog(data: {
  userId: number;
  action: string;
  ipAddress?: string;
}) {
  return db.insert(activityLogs).values(data);
}

export async function findActivityLogsByUser(userId: number) {
  return db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
    })
    .from(activityLogs)
    .where(eq(activityLogs.userId, userId))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getAllPlans() {
  return await db.select().from(plans);
}

export async function savePlanToDB({
  name,
  description,
  paypalPlanId,
  price,
}: {
  name: string;
  description: string;
  paypalPlanId: string;
  price: string;
}) {
  return db.insert(plans).values({ name, description, paypalPlanId, price });
}

export async function updateSubscription({
  userId,
  paypalSubscriptionId,
  paypalPlanId,
  startTime,
}: {
  userId: number;
  paypalSubscriptionId: string;
  paypalPlanId: string | number;
  startTime: string | Date;
}) {
  return db.insert(subscriptions).values({
    userId,
    paypalSubscriptionId,
    planId:
      typeof paypalPlanId === "string" ? parseInt(paypalPlanId) : paypalPlanId,
    status: "ACTIVE",
    startTime: new Date(startTime),
  });
}
