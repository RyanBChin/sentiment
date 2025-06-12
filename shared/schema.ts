import { pgTable, text, serial, integer, real, timestamp, boolean, jsonb, decimal, date } from "drizzle-orm/pg-core";
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

export const commodityHistory = pgTable("commodity_history", {
  id: serial("id").primaryKey(),
  commodityId: integer("commodity_id").references(() => commodities.id),
  date: text("date").notNull(),
  sentimentScore: real("sentiment_score").notNull(),
  price: real("price").notNull(),
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

// Raw news table - 뉴스 원문 수집
export const rawNews = pgTable("raw_news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  source: text("source"),
  url: text("url"),
  publishedTime: timestamp("published_time", { withTimezone: true }),
  collectedTime: timestamp("collected_time", { withTimezone: true }).defaultNow().notNull(),
  commodity: text("commodity"),
  analysisStatus: boolean("analysis_status").default(false).notNull(),
  relevantNews: boolean("relevant_news"),
});

// News analysis results table - 단일 기사 분석 결과
export const newsAnalysisResults = pgTable("news_analysis_results", {
  id: serial("id").primaryKey(),
  rawNewsId: integer("raw_news_id").notNull().references(() => rawNews.id, { onDelete: "cascade" }),
  sentimentScore: integer("sentiment_score"),
  reasoning: text("reasoning"),
  keywords: jsonb("keywords"),
  analysisTime: timestamp("analysis_time", { withTimezone: true }).defaultNow().notNull(),
});

// Daily market summary table - 일별 종합 분석
export const dailyMarketSummary = pgTable("daily_market_summary", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  commodity: text("commodity").notNull(),
  dailySentimentScore: decimal("daily_sentiment_score", { precision: 5, scale: 2 }),
  dailyReasoning: text("daily_reasoning"),
  dailyKeywords: jsonb("daily_keywords"),
  analyzedNewsCount: integer("analyzed_news_count"),
});

// Price history table - 가격 데이터
export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  commodity: text("commodity").notNull(),
  closingPrice: decimal("closing_price", { precision: 19, scale: 4 }),
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

export const insertCommodityHistorySchema = createInsertSchema(commodityHistory).omit({
  id: true,
});

export const insertEmailAlertSchema = createInsertSchema(emailAlerts).omit({
  id: true,
}).extend({
  frequency: z.enum(["hourly", "daily", "weekly", "on_update"])
});

export const insertRawNewsSchema = createInsertSchema(rawNews).omit({
  id: true,
  collectedTime: true,
});

export const insertNewsAnalysisResultsSchema = createInsertSchema(newsAnalysisResults).omit({
  id: true,
  analysisTime: true,
});

export const insertDailyMarketSummarySchema = createInsertSchema(dailyMarketSummary).omit({
  id: true,
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({
  id: true,
});

export type Commodity = typeof commodities.$inferSelect;
export type CommodityHistory = typeof commodityHistory.$inferSelect;
export type News = typeof news.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type EmailAlert = typeof emailAlerts.$inferSelect;
export type RawNews = typeof rawNews.$inferSelect;
export type NewsAnalysisResults = typeof newsAnalysisResults.$inferSelect;
export type DailyMarketSummary = typeof dailyMarketSummary.$inferSelect;
export type PriceHistory = typeof priceHistory.$inferSelect;

export type InsertCommodity = z.infer<typeof insertCommoditySchema>;
export type InsertCommodityHistory = z.infer<typeof insertCommodityHistorySchema>;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertEmailAlert = z.infer<typeof insertEmailAlertSchema>;
export type InsertRawNews = z.infer<typeof insertRawNewsSchema>;
export type InsertNewsAnalysisResults = z.infer<typeof insertNewsAnalysisResultsSchema>;
export type InsertDailyMarketSummary = z.infer<typeof insertDailyMarketSummarySchema>;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
