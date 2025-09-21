import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  bigint,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { sql, relations } from "drizzle-orm";

// USERS TABLE
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey().notNull(),
    name: varchar("name", { length: 100 }),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 20 }).notNull().default("viewer"),
    fetisherosUrl: varchar("fetisheros_url", { length: 255 })
      .notNull()
      .default("fetisheros.com"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)]
);

// PLANS TABLE
export const plans = mysqlTable(
  "plans",
  {
    id: int("id").autoincrement().primaryKey(),
    paypalPlanId: text("paypal_plan_id").notNull(),
    name: text("name").notNull(),
    price: text("price").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("plans_paypal_plan_id_idx").on(table.paypalPlanId)]
);

// SUBSCRIPTIONS TABLE
export const subscriptions = mysqlTable(
  "subscriptions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    paypalSubscriptionId: text("paypal_subscription_id").notNull(),
    planId: int("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    startTime: timestamp("start_time"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("subscriptions_user_plan_idx").on(table.userId, table.planId),
    uniqueIndex("subscriptions_paypal_subscription_idx").on(
      table.paypalSubscriptionId
    ),
  ]
);

// VIDEOS TABLE
export const videos = mysqlTable(
  "videos",
  {
    id: varchar("id", { length: 36 })
      .default(sql`(UUID())`) // Auto-generate UUID
      .primaryKey()
      .notNull(),
    title: text("title").notNull(),
    description: text("description"),
    url: text("url").notNull(),
    thumbnail: text("thumbnail"),
    uploaderId: int("uploader_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isPublic: boolean("is_public").notNull().default(false),
    views: bigint("views", { mode: "number" }).notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("videos_uploader_idx").on(table.uploaderId)]
);

// VIDEO TAGS TABLE
export const videoTags = mysqlTable(
  "video_tags",
  {
    id: int("id").autoincrement().primaryKey(),
    videoId: varchar("video_id", { length: 36 })
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
  },
  (table) => [index("video_tags_video_id_idx").on(table.videoId)]
);

// ACTIVITY LOGS TABLE
export const activityLogs = mysqlTable(
  "activity_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
  },
  (table) => [
    index("activity_logs_user_id_idx").on(table.userId),
    index("activity_logs_action_idx").on(table.action),
  ]
);

// ACTIVITY ENUM
export enum ActivityType {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
  UPDATE_PASSWORD = "UPDATE_PASSWORD",
  DELETE_ACCOUNT = "DELETE_ACCOUNT",
  UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
  WATCH_VIDEO = "WATCH_VIDEO",
  SUBSCRIBE = "SUBSCRIBE",
  UNSUBSCRIBE = "UNSUBSCRIBE",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  ADD_VIDEO = "ADD_VIDEO",
}

// RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  activityLogs: many(activityLogs),
  subscriptions: many(subscriptions),
  videos: many(videos, {
    relationName: "videos_uploaded",
  }),
}));

export const planRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  uploader: one(users, {
    fields: [videos.uploaderId],
    references: [users.id],
  }),
  tags: many(videoTags),
}));

export const videoTagsRelations = relations(videoTags, ({ one }) => ({
  video: one(videos, {
    fields: [videoTags.videoId],
    references: [videos.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// TYPES
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;

export type Plans = typeof plans.$inferSelect;
export type NewPlans = typeof plans.$inferInsert;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
