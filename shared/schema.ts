import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const commodities = pgTable("commodities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  englishName: text("english_name").notNull(),
  sentimentScore: real("sentiment_score").notNull(),
  price: real("price").notNull(),
  priceChange: real("price_change").notNull(),
  keywords: text("keywords").array().notNull(),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  commodityId: integer("commodity_id").references(() => commodities.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  snippet: text("snippet").notNull(),
  sentimentScore: real("sentiment_score").notNull(),
  keywords: text("keywords").array().notNull(),
  publishedAt: timestamp("published_at").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const emailAlerts = pgTable("email_alerts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  commodities: text("commodities").array().notNull(),
  frequency: text("frequency").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const insertCommoditySchema = createInsertSchema(commodities).omit({
  id: true,
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
});

export const insertEmailAlertSchema = createInsertSchema(emailAlerts).omit({
  id: true,
}).extend({
  frequency: z.enum(["hourly", "daily", "weekly", "on_update"])
});

export type Commodity = typeof commodities.$inferSelect;
export type News = typeof news.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type EmailAlert = typeof emailAlerts.$inferSelect;
export type InsertCommodity = z.infer<typeof insertCommoditySchema>;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertEmailAlert = z.infer<typeof insertEmailAlertSchema>;
