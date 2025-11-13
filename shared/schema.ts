import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("America/New_York"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const oauthTokens = pgTable("oauth_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  scopes: text("scopes").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  workdayStart: text("workday_start").notNull().default("08:00"),
  workdayEnd: text("workday_end").notNull().default("16:00"),
  meetingWindowsJson: jsonb("meeting_windows_json").default(sql`'[]'::jsonb`),
  deepWorkBlocksJson: jsonb("deep_work_blocks_json").default(sql`'[]'::jsonb`),
  trelloBoardId: text("trello_board_id"),
  trelloListId: text("trello_list_id"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const emailRules = pgTable("email_rules", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ruleName: text("rule_name").notNull(),
  matcherJson: jsonb("matcher_json").notNull(),
  actionsJson: jsonb("actions_json").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: text("status").notNull().default("pending"),
  dueAt: timestamp("due_at"),
  source: text("source"),
  metadataJson: jsonb("metadata_json").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  name: text("name").notNull(),
  source: text("source"),
  socialJson: jsonb("social_json").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pipelines = pgTable("pipelines", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  dealId: text("deal_id").notNull(),
  stage: text("stage").notNull(),
  value: integer("value").notNull().default(0),
  nextActionAt: timestamp("next_action_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  network: text("network").notNull(),
  status: text("status").notNull().default("draft"),
  content: text("content").notNull(),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sops = pgTable("sops", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  embedding: text("embedding"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const eventsCache = pgTable("events_cache", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  source: text("source").notNull(),
  externalId: text("external_id").notNull(),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  metadataJson: jsonb("metadata_json").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const emailPriorityCache = pgTable("email_priority_cache", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  emailId: text("email_id").notNull().unique(),
  priority: text("priority").notNull(),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
});

export const gifts = pgTable("gifts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  person: text("person").notNull(),
  occasion: text("occasion").notNull(),
  dueAt: timestamp("due_at").notNull(),
  status: text("status").notNull().default("pending"),
  shippingLabelUrl: text("shipping_label_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertOauthTokenSchema = createInsertSchema(oauthTokens).omit({
  id: true,
  createdAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertPipelineSchema = createInsertSchema(pipelines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(eventsCache).omit({
  id: true,
  createdAt: true,
});

export const insertEmailPriorityCacheSchema = createInsertSchema(
  emailPriorityCache
).omit({
  id: true,
  analyzedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type OauthToken = typeof oauthTokens.$inferSelect;
export type InsertOauthToken = z.infer<typeof insertOauthTokenSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Pipeline = typeof pipelines.$inferSelect;
export type InsertPipeline = z.infer<typeof insertPipelineSchema>;

export type EventCache = typeof eventsCache.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EmailPriorityCache = typeof emailPriorityCache.$inferSelect;
export type InsertEmailPriorityCache = z.infer<
  typeof insertEmailPriorityCacheSchema
>;
