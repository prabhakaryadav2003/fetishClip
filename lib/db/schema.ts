import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  uuid,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// USERS TABLE
export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("viewer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// PLANS TABLE
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  paypalPlanId: text("paypal_plan_id").notNull(),
  name: text("name").notNull(),
  price: text("price").notNull(), // Fixed field name
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SUBSCRIPTIONS TABLE
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  paypalSubscriptionId: text("paypal_subscription_id").notNull(),
  planId: integer("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  startTime: timestamp("start_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Videos Table
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  thumbnail: text("thumbnail"),
  uploaderId: integer("uploader_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity Logs Table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
});

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

export const videosRelations = relations(videos, ({ one }) => ({
  uploader: one(users, {
    fields: [videos.uploaderId],
    references: [users.id],
    relationName: "uploader",
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;

export type Plans = typeof plans.$inferSelect;
export type NewPlans = typeof plans.$inferInsert;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
