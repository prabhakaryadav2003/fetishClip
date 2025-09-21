import { desc, and, eq, isNull, ilike } from "drizzle-orm";
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
import { VideoData } from "../../types/videoData";
import { sql } from "drizzle-orm";

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
  data: { name?: string; email?: string; url?: string }
) {
  const { name, email, url } = data;
  const updates: any = { updatedAt: new Date() };
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (url) updates.fetisherosUrl = url;
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
// export async function getAllVideos() {
//   return db.select().from(videos).orderBy(desc(videos.createdAt));
// }

// Helper to map DB rows to VideoData
const mapToVideoData = (row: any): VideoData => ({
  id: row.id,
  title: row.title,
  description: row.description ?? "",
  tags: row.tags ?? [],
  uploaderName: row.uploaderName ?? "Unknown",
  uploaderUrl: row.uploaderUrl ?? "",
  videoUrl: row.url,
  thumbnailUrl: row.thumbnail ?? "",
  isPublic: row.isPublic ?? "false",
  views: Number(row.views),
  uploadDate: row.createdAt.toISOString(),
});

/**
 * Fetch all videos
 */

export async function getAllVideos(
  page = 1,
  limit = 9,
  search?: string
): Promise<{ videos: VideoData[]; total: number }> {
  const offset = (page - 1) * limit;

  // Where clause for search
  const where = search ? ilike(videos.title, `%${search}%`) : undefined;

  // Fetch videos (paginated)
  const rows = await db
    .select({
      id: videos.id,
      title: videos.title,
      description: videos.description,
      url: videos.url,
      thumbnail: videos.thumbnail,
      views: videos.views,
      createdAt: videos.createdAt,
      uploaderName: users.name,
      tags: sql<string[]>`COALESCE(array_agg(${videoTags.tag}), '{}')`,
    })
    .from(videos)
    .leftJoin(users, eq(videos.uploaderId, users.id))
    .leftJoin(videoTags, eq(videos.id, videoTags.videoId))
    .where(where ?? sql`TRUE`)
    .groupBy(videos.id, users.name)
    .orderBy(desc(videos.createdAt))
    .limit(limit)
    .offset(offset);

  // Get total count (for pagination UI)
  const totalRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(videos)
    .where(where ?? sql`TRUE`);

  const total = Number(totalRes[0].count);

  return {
    videos: rows.map(mapToVideoData),
    total,
  };
}

/**
 * Fetch only public videos
 */
export async function getPublicVideos(): Promise<VideoData[]> {
  const rows = await db
    .select({
      id: videos.id,
      title: videos.title,
      description: videos.description,
      url: videos.url,
      thumbnail: videos.thumbnail,
      views: videos.views,
      createdAt: videos.createdAt,
      uploaderName: users.name,
      tags: sql<string[]>`COALESCE(array_agg(${videoTags.tag}), '{}')`,
    })
    .from(videos)
    .leftJoin(users, eq(videos.uploaderId, users.id))
    .leftJoin(videoTags, eq(videos.id, videoTags.videoId))
    .where(eq(videos.isPublic, true))
    .groupBy(videos.id, users.name);

  return rows.map(mapToVideoData);
}

export async function getVideoById(id: string): Promise<VideoData | null> {
  return db.transaction(async (tx) => {
    // Increment view count atomically
    await tx
      .update(videos)
      .set({ views: sql`${videos.views} + 1` })
      .where(eq(videos.id, id));

    // Fetch updated video with joins
    const row = await tx
      .select({
        id: videos.id,
        title: videos.title,
        description: videos.description,
        url: videos.url,
        thumbnail: videos.thumbnail,
        views: videos.views,
        createdAt: videos.createdAt,
        uploaderName: users.name,
        uploaderUrl: users.fetisherosUrl,
        tags: sql<string[]>`COALESCE(array_agg(${videoTags.tag}), '{}')`,
      })
      .from(videos)
      .leftJoin(users, eq(videos.uploaderId, users.id))
      .leftJoin(videoTags, eq(videos.id, videoTags.videoId))
      .where(eq(videos.id, id))
      .groupBy(videos.id, users.name, users.fetisherosUrl)
      .limit(1);

    if (!row[0]) return null;

    return mapToVideoData(row[0]);
  });
}

// List videos from a specific creator
export async function getVideosByCreator(
  creatorId: number
): Promise<VideoData[]> {
  const rows = await db
    .select({
      id: videos.id,
      title: videos.title,
      description: videos.description,
      url: videos.url,
      thumbnail: videos.thumbnail,
      views: videos.views,
      isPublic: videos.isPublic,
      createdAt: videos.createdAt,
      uploaderName: users.name,
      tags: sql<string[]>`COALESCE(array_agg(${videoTags.tag}), '{}')`,
    })
    .from(videos)
    .leftJoin(users, eq(videos.uploaderId, users.id))
    .leftJoin(videoTags, eq(videos.id, videoTags.videoId))
    .where(eq(videos.uploaderId, creatorId))
    .groupBy(videos.id, users.name)
    .orderBy(desc(videos.createdAt));

  return rows.map(mapToVideoData);
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

// Update video and tags, returning the updated video
export async function updateVideo(
  id: string, // UUID
  data: Partial<{
    title: string;
    description: string;
    isPublic: boolean;
    tags: string[];
  }>
) {
  return db.transaction(async (tx) => {
    // Update main video fields
    await tx
      .update(videos)
      .set({
        title: data.title,
        description: data.description,
        isPublic: data.isPublic,
      })
      .where(eq(videos.id, id));

    // Update tags
    if (data.tags) {
      await tx.delete(videoTags).where(eq(videoTags.videoId, id));
      await tx.insert(videoTags).values(
        data.tags.map((tag) => ({
          videoId: id,
          tag,
        }))
      );
    }

    // Fetch updated video including tags
    const updatedVideo = await tx
      .select({
        id: videos.id,
        title: videos.title,
        description: videos.description,
        isPublic: videos.isPublic,
      })
      .from(videos)
      .where(eq(videos.id, id))
      .then(async (rows) => {
        const video = rows[0];
        const tagsRows = await tx
          .select({ tag: videoTags.tag })
          .from(videoTags)
          .where(eq(videoTags.videoId, id));
        return {
          ...video,
          tags: tagsRows.map((r) => r.tag),
        };
      });

    return updatedVideo;
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

export async function getUserSubscriptionStatus(userId: number) {
  const subscription = await db
    .select({
      status: subscriptions.status,
    })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)
    .execute();

  // subscription is an array; return status or null
  return subscription[0]?.status ?? null;
}
