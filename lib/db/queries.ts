import { desc, and, eq, isNull, sql } from "drizzle-orm";
import { db } from "./drizzle";
import {
  activityLogs,
  users,
  videos,
  videoTags,
  plans,
  subscriptions,
} from "./schema";
import { User } from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";
import { VideoData } from "@/types/videoData";
import { v4 as uuidv4 } from "uuid";

/**
 * Helper: returns current timestamp for consistency
 */
function now() {
  return new Date();
}

/**
 * Soft delete a user and clean up related records
 */
export async function deleteUser(userId: number) {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Soft-delete the user
  await db
    .update(users)
    .set({
      deletedAt: now(),
      updatedAt: now(),
      email: `${user.email}-${user.id}-deleted`,
    })
    .where(eq(users.id, userId));

  // Clean up related data
  await db.delete(videos).where(eq(videos.uploaderId, userId));
  await db.delete(activityLogs).where(eq(activityLogs.userId, userId));
}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string;
  passwordHash: string;
  role?: string;
}) {
  const { email, passwordHash, role = "viewer" } = data;

  const [result] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      role,
      createdAt: now(),
      updatedAt: now(),
    })
    .$returningId(); // MySQL/MariaDB helper

  return result;
}

/**
 * Get the currently authenticated user based on session cookie
 */
export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie?.value) return null;

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData?.user ||
    typeof sessionData.user.id !== "number" ||
    new Date(sessionData.expires) < new Date()
  ) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  return user[0] ?? null;
}

/**
 * Fetch a user by their ID, ignoring soft-deleted users
 */
export async function getUserById(userId: number) {
  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  return user[0] ?? null;
}

/**
 * Fetch a user by email
 */
export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Change a user's password
 */
export async function changeUserPassword(
  userId: number,
  newPasswordHash: string
) {
  await db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      updatedAt: now(),
    })
    .where(eq(users.id, userId));
}

/**
 * Update user's account info (name, email, fetisherosUrl)
 */
export async function updateUserAccount(
  userId: number,
  data: Partial<User & { url?: string }>
) {
  const updates: Partial<typeof data & { updatedAt: Date }> = {
    updatedAt: now(),
  };
  if (data.name) updates.name = data.name;
  if (data.email) updates.email = data.email;
  if (data.url) updates.fetisherosUrl = data.url;

  await db.update(users).set(updates).where(eq(users.id, userId));
}

/**
 * Update user's subscription-related fields
 */
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
      updatedAt: now(),
    })
    .where(eq(users.id, userId));
}

/**
 * Map DB row to VideoData type
 */
const mapToVideoData = (row: any): VideoData => ({
  id: row.id,
  title: row.title,
  description: row.description ?? "",
  tags: row.tags ?? [],
  uploaderName: row.uploaderName ?? "Unknown",
  uploaderUrl: row.uploaderUrl ?? "",
  videoUrl: row.url,
  thumbnailUrl: row.thumbnail ?? "",
  isPublic: row.isPublic,
  views: Number(row.views),
  uploadDate: row.createdAt.toISOString(),
});

/**
 * Fetch all videos (paginated + optional search)
 */
export async function getAllVideos(
  page = 1,
  limit = 9,
  search?: string
): Promise<{ videos: VideoData[]; total: number }> {
  const offset = (page - 1) * limit;

  // Build case-insensitive search
  const searchWhere = search
    ? sql`LOWER(${videos.title}) LIKE ${"%" + search.toLowerCase() + "%"}`
    : sql`TRUE`;

  // Fetch videos with uploader info and tags
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
      uploaderUrl: users.fetisherosUrl,
      // MariaDB does not have array_agg, so use GROUP_CONCAT for tags
      tags: sql<string>`COALESCE(GROUP_CONCAT(${videoTags.tag} SEPARATOR ','), '')`,
    })
    .from(videos)
    .leftJoin(users, eq(videos.uploaderId, users.id))
    .leftJoin(videoTags, eq(videos.id, videoTags.videoId))
    .where(searchWhere)
    .groupBy(videos.id)
    .orderBy(desc(videos.createdAt))
    .limit(limit)
    .offset(offset);

  // Map tags string to array
  const mappedRows = rows.map((row: any) => ({
    ...row,
    tags: row.tags ? (row.tags as string).split(",") : [],
  }));

  // Get total count for pagination
  const totalRes = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(videos)
    .where(searchWhere);

  const total = Number(totalRes[0].count);

  return {
    videos: mappedRows.map(mapToVideoData),
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
      uploaderUrl: users.fetisherosUrl,
      tags: sql<string>`COALESCE(GROUP_CONCAT(${videoTags.tag} SEPARATOR ','), '')`,
    })
    .from(videos)
    .leftJoin(users, eq(videos.uploaderId, users.id))
    .leftJoin(videoTags, eq(videos.id, videoTags.videoId))
    .where(eq(videos.isPublic, true))
    .groupBy(videos.id);

  return rows.map((r: any) =>
    mapToVideoData({ ...r, tags: r.tags ? r.tags.split(",") : [] })
  );
}

/**
 * Fetch video by ID and increment view count atomically
 */
export async function getVideoById(id: string): Promise<VideoData | null> {
  return db.transaction(async (tx) => {
    // Increment view count
    await tx
      .update(videos)
      .set({ views: sql`${videos.views} + 1` })
      .where(eq(videos.id, id));

    // Fetch video with uploader and tags
    const row = await tx
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
        uploaderUrl: users.fetisherosUrl,
        tags: sql<string>`COALESCE(GROUP_CONCAT(${videoTags.tag} SEPARATOR ','), '')`,
      })
      .from(videos)
      .leftJoin(users, eq(videos.uploaderId, users.id))
      .leftJoin(videoTags, eq(videos.id, videoTags.videoId))
      .where(eq(videos.id, id))
      .groupBy(videos.id, users.name, users.fetisherosUrl)
      .limit(1);

    if (!row[0]) return null;
    return mapToVideoData({
      ...row[0],
      tags: row[0].tags ? row[0].tags.split(",") : [],
    });
  });
}

/**
 * Fetch videos by creator
 */
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
      tags: sql<string>`COALESCE(GROUP_CONCAT(${videoTags.tag} SEPARATOR ','), '')`,
    })
    .from(videos)
    .leftJoin(users, eq(videos.uploaderId, users.id))
    .leftJoin(videoTags, eq(videos.id, videoTags.videoId))
    .where(eq(videos.uploaderId, creatorId))
    .groupBy(videos.id, users.name)
    .orderBy(desc(videos.createdAt));

  return rows.map((r: any) =>
    mapToVideoData({ ...r, tags: r.tags ? r.tags.split(",") : [] })
  );
}

/**
 * Insert video + tags
 */
export async function insertVideo(data: {
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  uploaderId: number;
  tags: string[];
}) {
  return db.transaction(async (tx) => {
    // Generate a UUID for the new video
    const videoId = uuidv4();

    // Insert the video
    await tx.insert(videos).values({
      id: videoId,
      title: data.title,
      description: data.description,
      url: data.url,
      thumbnail: data.thumbnail,
      uploaderId: data.uploaderId,
      isPublic: false,
      views: 0,
    });

    // Insert tags if provided
    if (data.tags?.length) {
      await tx.insert(videoTags).values(
        data.tags.map((tag) => ({
          videoId,
          tag,
        }))
      );
    }

    return videoId;
  });
}

/**
 * Update video + tags
 */
export async function updateVideo(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    isPublic: boolean;
    tags: string[];
  }>
) {
  return db.transaction(async (tx) => {
    // Update video
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
      await tx
        .insert(videoTags)
        .values(data.tags.map((tag) => ({ videoId: id, tag })));
    }

    // Fetch updated video with tags
    const updatedRows = await tx
      .select({
        id: videos.id,
        title: videos.title,
        description: videos.description,
        isPublic: videos.isPublic,
      })
      .from(videos)
      .where(eq(videos.id, id));

    const updatedVideo = updatedRows[0];
    if (!updatedVideo) return null;

    const tagsRows = await tx
      .select({ tag: videoTags.tag })
      .from(videoTags)
      .where(eq(videoTags.videoId, id));

    return { ...updatedVideo, tags: tagsRows.map((r) => r.tag) };
  });
}

/**
 * Delete a video and all its associated tags
 */
export async function deleteVideo(id: string) {
  return db.transaction(async (tx) => {
    await tx.delete(videoTags).where(eq(videoTags.videoId, id));
    await tx.delete(videos).where(eq(videos.id, id));
  });
}

/**
 * Fetch the 10 most recent activity logs for the current authenticated user
 */
export async function getActivityLogs() {
  const user = await getUser();
  if (!user) throw new Error("User not authenticated");

  return db
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

/**
 * Insert a new activity log
 */
export async function insertActivityLog(data: {
  userId: number;
  action: string;
  ipAddress?: string;
}) {
  return db.insert(activityLogs).values(data);
}

/**
 * Find the 10 most recent activity logs for a specific user
 */
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

/**
 * Fetch all subscription plans
 */
export async function getAllPlans() {
  return db.select().from(plans);
}

/**
 * Insert a new plan into the database
 */
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
  const [id] = await db
    .insert(plans)
    .values({ name, description, paypalPlanId, price })
    .$returningId();
  return id;
}

/**
 * Add or update a subscription for a user
 */
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
  const planId =
    typeof paypalPlanId === "string" ? parseInt(paypalPlanId) : paypalPlanId;

  return db.insert(subscriptions).values({
    userId,
    paypalSubscriptionId,
    planId,
    status: "ACTIVE",
    startTime: new Date(startTime),
  });
}

/**
 * Get the current subscription status of a user
 */
export async function getUserSubscriptionStatus(userId: number) {
  const subscription = await db
    .select({ status: subscriptions.status })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)
    .execute();

  return subscription[0]?.status ?? null;
}
