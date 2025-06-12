import {
  commodities,
  commodityHistory,
  news,
  chatMessages,
  emailAlerts,
  rawNews,
  newsAnalysisResults,
  dailyMarketSummary,
  priceHistory,
  type Commodity,
  type CommodityHistory,
  type News,
  type ChatMessage,
  type EmailAlert,
  type RawNews,
  type NewsAnalysisResults,
  type DailyMarketSummary,
  type PriceHistory,
  type InsertCommodity,
  type InsertCommodityHistory,
  type InsertNews,
  type InsertChatMessage,
  type InsertEmailAlert,
  type InsertRawNews,
  type InsertNewsAnalysisResults,
  type InsertDailyMarketSummary,
  type InsertPriceHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Commodities
  getCommodities(): Promise<Commodity[]>;
  getCommodity(id: number): Promise<Commodity | undefined>;
  getCommodityHistory(commodityId: number): Promise<CommodityHistory[]>;
  getSentimentAlert(): Promise<any>;

  // News
  getNewsByCommodity(commodityId: number): Promise<News[]>;
  getNews(id: number): Promise<News | undefined>;
  getLatestNews(): Promise<News[]>;

  // Chat
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(): Promise<ChatMessage[]>;

  // Email Alerts
  createEmailAlert(alert: InsertEmailAlert): Promise<EmailAlert>;
  getEmailAlerts(): Promise<EmailAlert[]>;

  // Raw News - 뉴스 원문 수집
  createRawNews(rawNews: InsertRawNews): Promise<RawNews>;
  getRawNews(id: number): Promise<RawNews | undefined>;
  getRawNewsByStatus(analysisStatus: boolean): Promise<RawNews[]>;
  updateRawNewsStatus(id: number, analysisStatus: boolean): Promise<void>;

  // News Analysis Results - 단일 기사 분석 결과
  createNewsAnalysisResult(
    analysis: InsertNewsAnalysisResults,
  ): Promise<NewsAnalysisResults>;
  getNewsAnalysisResults(rawNewsId: number): Promise<NewsAnalysisResults[]>;

  // Daily Market Summary - 일별 종합 분석
  createDailyMarketSummary(
    summary: InsertDailyMarketSummary,
  ): Promise<DailyMarketSummary>;
  getDailyMarketSummary(
    date: string,
    commodity: string,
  ): Promise<DailyMarketSummary | undefined>;
  getDailyMarketSummaries(commodity?: string): Promise<DailyMarketSummary[]>;

  // Price History - 가격 데이터
  createPriceHistory(priceData: InsertPriceHistory): Promise<PriceHistory>;
  getPriceHistory(
    commodity: string,
    startDate?: string,
    endDate?: string,
  ): Promise<PriceHistory[]>;
}

export class MemStorage implements IStorage {
  private commodities: Map<number, Commodity>;
  private commodityHistory: Map<number, CommodityHistory[]>;
  private news: Map<number, News>;
  private chatMessages: Map<number, ChatMessage>;
  private emailAlerts: Map<number, EmailAlert>;
  private currentCommodityId: number;
  private currentHistoryId: number;
  private currentNewsId: number;
  private currentChatId: number;
  private currentAlertId: number;

  constructor() {
    this.commodities = new Map();
    this.commodityHistory = new Map();
    this.news = new Map();
    this.chatMessages = new Map();
    this.emailAlerts = new Map();
    this.currentCommodityId = 1;
    this.currentHistoryId = 1;
    this.currentNewsId = 1;
    this.currentChatId = 1;
    this.currentAlertId = 1;

    this.initializeData();
  }

  private initializeData() {
    // Initialize commodities data

    // Generate historical data for the last 14 days
    this.generateHistoricalData();
  }

  private generateHistoricalData() {
    const commodityIds = [1, 2, 3, 4, 5];
    const baseData = {
      1: { basePrice: 600, baseScore: 85 }, // Corn
      2: { basePrice: 340, baseScore: 45 }, // Wheat
      3: { basePrice: 8200, baseScore: 76 }, // Copper
      4: { basePrice: 75, baseScore: 58 }, // WTI
      5: { basePrice: 1940, baseScore: 82 }, // Gold
    };

    commodityIds.forEach((commodityId) => {
      const history: CommodityHistory[] = [];
      const base = baseData[commodityId as keyof typeof baseData];

      for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        // Generate realistic fluctuations
        const priceFactor = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
        const scoreFactor = 1 + (Math.random() - 0.5) * 0.2; // ±10% variation

        const historyItem: CommodityHistory = {
          id: this.currentHistoryId++,
          commodityId,
          date: dateStr,
          price: Number((base.basePrice * priceFactor).toFixed(2)),
          sentimentScore: Number((base.baseScore * scoreFactor).toFixed(1)),
        };

        history.push(historyItem);
      }

      this.commodityHistory.set(commodityId, history);
    });
  }

  async getCommodities(): Promise<Commodity[]> {
    return Array.from(this.commodities.values());
  }

  async getCommodity(id: number): Promise<Commodity | undefined> {
    return this.commodities.get(id);
  }

  async getCommodityHistory(commodityId: number): Promise<CommodityHistory[]> {
    return this.commodityHistory.get(commodityId) || [];
  }

  async getNewsByCommodity(commodityId: number): Promise<News[]> {
    return Array.from(this.news.values()).filter(
      (news) => news.commodityId === commodityId,
    );
  }

  async getNews(id: number): Promise<News | undefined> {
    return this.news.get(id);
  }

  async createChatMessage(
    insertMessage: InsertChatMessage,
  ): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values());
  }

  async createEmailAlert(insertAlert: InsertEmailAlert): Promise<EmailAlert> {
    const id = this.currentAlertId++;
    const alert: EmailAlert = {
      ...insertAlert,
      id,
      createdAt: new Date(),
    };
    this.emailAlerts.set(id, alert);
    return alert;
  }

  async getEmailAlerts(): Promise<EmailAlert[]> {
    return Array.from(this.emailAlerts.values());
  }

  async getLatestNews(): Promise<News[]> {
    // Get latest 5 news items across all commodities
    const allNews = Array.from(this.news.values());
    return allNews
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
      .slice(0, 5);
  }

  async getSentimentAlert(): Promise<any> {
    // Calculate sentiment changes over the last 3 days for each commodity
    const alerts = [];

    Array.from(this.commodityHistory.entries()).forEach(
      ([commodityId, history]) => {
        if (history.length >= 4) {
          const latest = history[history.length - 1];
          const threeDaysAgo = history[history.length - 4]; // 3 days ago
          const change = latest.sentimentScore - threeDaysAgo.sentimentScore;

          const commodity = this.commodities.get(commodityId);
          const news = Array.from(this.news.values()).filter(
            (n) => n.commodityId === commodityId,
          );
          const latestNews = news.length > 0 ? news[0] : null;

          if (commodity) {
            alerts.push({
              commodityId,
              commodity: commodity.name,
              englishName: commodity.englishName,
              scoreChange: Number(change.toFixed(1)),
              from: threeDaysAgo.sentimentScore,
              to: latest.sentimentScore,
              headline: latestNews?.title || `${commodity.name} 시장 동향`,
              summary:
                latestNews?.snippet ||
                `${commodity.name}의 시장 센티먼트가 변화하고 있습니다.`,
            });
          }
        }
      },
    );

    // Return the commodity with the biggest absolute change
    const biggestChange = alerts.reduce((max, current) =>
      Math.abs(current.scoreChange) > Math.abs(max.scoreChange) ? current : max,
    );

    return biggestChange;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getCommodities(): Promise<Commodity[]> {
    // Get basic commodity data first
    const commodityList = await db
      .select()
      .from(commodities)
      .orderBy(commodities.id);

    // For each commodity, get the latest data from other tables
    const commoditiesWithData = await Promise.all(
      commodityList.map(async (commodity) => {
        // Get latest daily market summary
        const [latestSummary] = await db
          .select()
          .from(dailyMarketSummary)
          .where(eq(dailyMarketSummary.commodity, commodity.name))
          .orderBy(desc(dailyMarketSummary.date))
          .limit(1);

        // Get latest price
        const [latestPrice] = await db
          .select()
          .from(priceHistory)
          .where(eq(priceHistory.commodity, commodity.name))
          .orderBy(desc(priceHistory.date))
          .limit(1);

        // Get previous price for change calculation
        const previousPrices = await db
          .select()
          .from(priceHistory)
          .where(eq(priceHistory.commodity, commodity.name))
          .orderBy(desc(priceHistory.date))
          .limit(2);

        let priceChange = 0;
        if (previousPrices.length >= 2) {
          const current = parseFloat(previousPrices[0].closingPrice || "0");
          const previous = parseFloat(previousPrices[1].closingPrice || "0");
          priceChange =
            previous > 0 ? ((current - previous) / previous) * 100 : 0;
        }

        return {
          id: commodity.id,
          name: commodity.name,
          englishName: commodity.englishName,
          sentimentScore: latestSummary
            ? parseFloat(latestSummary.dailySentimentScore || "0")
            : commodity.sentimentScore,
          price: latestPrice
            ? parseFloat(latestPrice.closingPrice || "0")
            : commodity.price,
          priceChange: parseFloat(priceChange.toFixed(2)),
          keywords: latestSummary?.dailyKeywords
            ? this.extractKeywords(latestSummary.dailyKeywords)
            : commodity.keywords || ["시장분석", "동향"],
        };
      }),
    );

    return commoditiesWithData as Commodity[];
  }

  async getCommodity(id: number): Promise<Commodity | undefined> {
    const [commodity] = await db
      .select()
      .from(commodities)
      .where(eq(commodities.id, id));
    return commodity || undefined;
  }

  async getCommodityHistory(commodityId: number): Promise<CommodityHistory[]> {
    return await db
      .select()
      .from(commodityHistory)
      .where(eq(commodityHistory.commodityId, commodityId));
  }

  async getSentimentAlert(): Promise<any> {
    // Return a mock sentiment alert for now
    const commodityList = await this.getCommodities();
    if (commodityList.length > 0) {
      const randomCommodity =
        commodityList[Math.floor(Math.random() * commodityList.length)];
      return {
        commodityId: randomCommodity.id,
        commodity: randomCommodity.name,
        englishName: randomCommodity.englishName,
        currentScore: randomCommodity.sentimentScore,
        scoreChange: Math.floor(Math.random() * 20) - 10,
        timestamp: new Date().toISOString(),
      };
    }
    return null;
  }

  async getNewsByCommodity(commodityId: number): Promise<News[]> {
    // Get commodity name first
    const commodity = await this.getCommodity(commodityId);
    if (!commodity) return [];

    // Get news data from raw_news and news_analysis_results tables
    const result = await db
      .select({
        id: rawNews.id,
        title: rawNews.title,
        content: rawNews.content,
        sentimentScore: newsAnalysisResults.sentimentScore,
        keywords: newsAnalysisResults.keywords,
        publishedAt: rawNews.publishedTime,
      })
      .from(rawNews)
      .leftJoin(
        newsAnalysisResults,
        eq(rawNews.id, newsAnalysisResults.rawNewsId),
      )
      .where(eq(rawNews.commodity, commodity.name))
      .orderBy(desc(rawNews.publishedTime))
      .limit(10);

    return result.map((item) => ({
      id: item.id,
      commodityId: commodityId,
      title: item.title || "",
      content: item.content || "",
      snippet:
        typeof item.content === "string"
          ? item.content.substring(0, 100) + "..."
          : "내용을 불러오는 중...",
      sentimentScore: parseFloat(item.sentimentScore?.toString() || "0"),
      keywords: this.extractKeywords(item.keywords),
      publishedAt: item.publishedAt || new Date(),
    })) as News[];
  }

  private extractKeywords(keywords: any): string[] {
    if (!keywords) return ["분석중"];
    if (typeof keywords === "object") {
      const allKeywords = [
        ...(keywords.positive || []),
        ...(keywords.negative || []),
        ...(keywords.neutral || []),
        ...(keywords.top_keywords || []),
      ];
      return allKeywords.length > 0 ? allKeywords : ["분석중"];
    }
    return ["분석중"];
  }

  async getNews(id: number): Promise<News | undefined> {
    const [newsItem] = await db.select().from(news).where(eq(news.id, id));
    return newsItem || undefined;
  }

  async getLatestNews(): Promise<News[]> {
    // Get news data from raw_news and news_analysis_results tables
    const result = await db
      .select({
        id: rawNews.id,
        commodityId: commodities.id,
        title: rawNews.title,
        content: rawNews.content,
        sentimentScore: newsAnalysisResults.sentimentScore,
        keywords: newsAnalysisResults.keywords,
        publishedAt: rawNews.publishedTime,
      })
      .from(rawNews)
      .leftJoin(
        newsAnalysisResults,
        eq(rawNews.id, newsAnalysisResults.rawNewsId),
      )
      .leftJoin(commodities, eq(rawNews.commodity, commodities.name))
      .where(eq(rawNews.relevantNews, true))
      .orderBy(desc(rawNews.publishedTime))
      .limit(10);

    return result.map((item) => ({
      id: item.id,
      commodityId: item.commodityId || 1,
      title: item.title || "",
      content: item.content || "",
      snippet:
        typeof item.content === "string"
          ? item.content.substring(0, 100) + "..."
          : "내용을 불러오는 중...",
      sentimentScore: parseFloat(item.sentimentScore?.toString() || "0"),
      keywords: this.extractKeywords(item.keywords),
      publishedAt: item.publishedAt || new Date(),
    })) as News[];
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return chatMessage;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.createdAt));
  }

  async createEmailAlert(alert: InsertEmailAlert): Promise<EmailAlert> {
    const [emailAlert] = await db.insert(emailAlerts).values(alert).returning();
    return emailAlert;
  }

  async getEmailAlerts(): Promise<EmailAlert[]> {
    return await db
      .select()
      .from(emailAlerts)
      .orderBy(desc(emailAlerts.createdAt));
  }

  // Raw News Methods
  async createRawNews(rawNewsData: InsertRawNews): Promise<RawNews> {
    const [rawNewsItem] = await db
      .insert(rawNews)
      .values(rawNewsData)
      .returning();
    return rawNewsItem;
  }

  async getRawNews(id: number): Promise<RawNews | undefined> {
    const [rawNewsItem] = await db
      .select()
      .from(rawNews)
      .where(eq(rawNews.id, id));
    return rawNewsItem || undefined;
  }

  async getRawNewsByStatus(analysisStatus: boolean): Promise<RawNews[]> {
    return await db
      .select()
      .from(rawNews)
      .where(eq(rawNews.analysisStatus, analysisStatus));
  }

  async updateRawNewsStatus(
    id: number,
    analysisStatus: boolean,
  ): Promise<void> {
    await db.update(rawNews).set({ analysisStatus }).where(eq(rawNews.id, id));
  }

  // News Analysis Results Methods
  async createNewsAnalysisResult(
    analysis: InsertNewsAnalysisResults,
  ): Promise<NewsAnalysisResults> {
    const [analysisResult] = await db
      .insert(newsAnalysisResults)
      .values(analysis)
      .returning();
    return analysisResult;
  }

  async getNewsAnalysisResults(
    rawNewsId: number,
  ): Promise<NewsAnalysisResults[]> {
    return await db
      .select()
      .from(newsAnalysisResults)
      .where(eq(newsAnalysisResults.rawNewsId, rawNewsId));
  }

  // Daily Market Summary Methods
  async createDailyMarketSummary(
    summary: InsertDailyMarketSummary,
  ): Promise<DailyMarketSummary> {
    const [marketSummary] = await db
      .insert(dailyMarketSummary)
      .values(summary)
      .returning();
    return marketSummary;
  }

  async getDailyMarketSummary(
    date: string,
    commodity: string,
  ): Promise<DailyMarketSummary | undefined> {
    const [summary] = await db
      .select()
      .from(dailyMarketSummary)
      .where(
        and(
          eq(dailyMarketSummary.date, date),
          eq(dailyMarketSummary.commodity, commodity),
        ),
      );
    return summary || undefined;
  }

  async getDailyMarketSummaries(
    commodity?: string,
  ): Promise<DailyMarketSummary[]> {
    if (commodity) {
      return await db
        .select()
        .from(dailyMarketSummary)
        .where(eq(dailyMarketSummary.commodity, commodity))
        .orderBy(desc(dailyMarketSummary.date));
    }
    return await db
      .select()
      .from(dailyMarketSummary)
      .orderBy(desc(dailyMarketSummary.date));
  }

  // Price History Methods
  async createPriceHistory(
    priceData: InsertPriceHistory,
  ): Promise<PriceHistory> {
    const [priceHistoryItem] = await db
      .insert(priceHistory)
      .values(priceData)
      .returning();
    return priceHistoryItem;
  }

  async getPriceHistory(
    commodity: string,
    startDate?: string,
    endDate?: string,
  ): Promise<PriceHistory[]> {
    return await db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.commodity, commodity))
      .orderBy(desc(priceHistory.date));
  }
}

export const storage = new DatabaseStorage();
