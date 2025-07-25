import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertChatMessageSchema, 
  insertEmailAlertSchema,
  insertRawNewsSchema,
  insertNewsAnalysisResultsSchema,
  insertDailyMarketSummarySchema,
  insertPriceHistorySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all commodities
  app.get("/api/commodities", async (req, res) => {
    try {
      const commodities = await storage.getCommodities();
      res.json(commodities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch commodities" });
    }
  });

  // Get commodity by ID
  app.get("/api/commodities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const commodity = await storage.getCommodity(id);
      if (!commodity) {
        return res.status(404).json({ message: "Commodity not found" });
      }
      res.json(commodity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch commodity" });
    }
  });

  // Get commodity history
  app.get("/api/commodities/:id/history", async (req, res) => {
    try {
      const commodityId = parseInt(req.params.id);
      const history = await storage.getCommodityHistory(commodityId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch commodity history" });
    }
  });

  // Get news by commodity ID
  app.get("/api/commodities/:id/news", async (req, res) => {
    try {
      const commodityId = parseInt(req.params.id);
      const news = await storage.getNewsByCommodity(commodityId);
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  // Get news by ID
  app.get("/api/news/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const news = await storage.getNews(id);
      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  // Chatbot endpoint
  app.post("/api/rag-chatbot", async (req, res) => {
    try {
      const { question } = req.body;
      
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ message: "Question is required" });
      }

      // Generate AI response based on question content
      let answer = "죄송합니다. 해당 질문에 대한 구체적인 분석을 제공하기 어렵습니다. 다른 질문을 해주세요.";
      
      const lowerQuestion = question.toLowerCase();
      
      if (lowerQuestion.includes('옥수수') || lowerQuestion.includes('corn')) {
        answer = "옥수수 가격 상승의 주요 원인은 미국 중서부 지역의 지속적인 가뭄과 중국의 수입 증가입니다. 현재 센티먼트 점수는 89.5로 매우 긍정적인 상황입니다. USDA의 생산량 전망치 하향 조정도 가격 상승을 뒷받침하고 있습니다.";
      } else if (lowerQuestion.includes('밀') || lowerQuestion.includes('wheat')) {
        answer = "밀 가격은 최근 공급 과잉 우려와 수요 감소로 인해 하락 압력을 받고 있습니다. 센티먼트 점수는 45.2로 부정적인 상황입니다. 주요 생산국들의 풍작 예상과 글로벌 경기 둔화가 영향을 미치고 있습니다.";
      } else if (lowerQuestion.includes('금') || lowerQuestion.includes('gold')) {
        answer = "금은 현재 인플레이션 우려와 안전자산 선호로 인해 좋은 투자 시점으로 평가됩니다. 센티먼트 점수는 82.1로 긍정적입니다. 지정학적 불안정성과 중앙은행들의 금 매입 증가가 가격을 지지하고 있습니다.";
      } else if (lowerQuestion.includes('구리') || lowerQuestion.includes('copper')) {
        answer = "구리는 전기차 수요 증가와 인프라 투자 확대로 인해 긍정적인 센티먼트를 보이고 있습니다. 현재 점수는 76.8입니다. 특히 신재생 에너지 산업의 성장과 5G 네트워크 구축이 수요를 견인하고 있습니다.";
      } else if (lowerQuestion.includes('wti') || lowerQuestion.includes('원유') || lowerQuestion.includes('oil')) {
        answer = "WTI 원유는 OPEC+의 감산 정책과 재고 감소로 가격 상승 요인이 있으나, 경기 둔화 우려로 상승폭이 제한되고 있습니다. 센티먼트 점수는 58.4로 중립적인 상황입니다.";
      } else if (lowerQuestion.includes('투자') || lowerQuestion.includes('전망') || lowerQuestion.includes('추천')) {
        answer = "현재 시장 상황을 종합하면, 옥수수(89.5)와 금(82.1)이 가장 긍정적인 센티먼트를 보이고 있습니다. 구리(76.8)도 중장기적으로 유망한 상품입니다. 다만 투자 결정 시에는 개인의 투자 성향과 리스크 허용도를 고려해야 합니다.";
      }

      // Save chat message
      const chatMessage = await storage.createChatMessage({
        question,
        answer,
        createdAt: new Date()
      });

      res.json({ answer });
    } catch (error) {
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Email alerts endpoint
  app.post("/api/email-alerts", async (req, res) => {
    try {
      const parsed = insertEmailAlertSchema.parse(req.body);
      const alert = await storage.createEmailAlert(parsed);
      res.json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  // Get email alerts
  app.get("/api/email-alerts", async (req, res) => {
    try {
      const alerts = await storage.getEmailAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email alerts" });
    }
  });

  // Get sentiment alert
  app.get("/api/sentiment-alert", async (req, res) => {
    try {
      const alert = await storage.getSentimentAlert();
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sentiment alert" });
    }
  });

  // Market Overview Expansion Endpoints
  app.get("/api/top-gainers-losers", async (req, res) => {
    try {
      const data = await storage.getTopGainersLosers();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gainers/losers data" });
    }
  });

  app.get("/api/top-movers", async (req, res) => {
    try {
      const period = req.query.period || '1d';
      const data = await storage.getTopMovers(period as string);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top movers data" });
    }
  });

  app.get("/api/latest-news-feed", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const news = await storage.getLatestNewsFeed(limit);
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news feed" });
    }
  });

  app.get("/api/price-history/:commodity", async (req, res) => {
    try {
      const { commodity } = req.params;
      const { startDate, endDate } = req.query;
      const history = await storage.getPriceHistory(
        commodity, 
        startDate as string, 
        endDate as string
      );
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch price history" });
    }
  });

  // Get latest news
  app.get("/api/latest-news", async (req, res) => {
    try {
      const news = await storage.getLatestNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch latest news" });
    }
  });

  // Raw news routes
  app.post('/api/raw-news', async (req, res) => {
    try {
      const validatedData = insertRawNewsSchema.parse(req.body);
      const rawNews = await storage.createRawNews(validatedData);
      res.json(rawNews);
    } catch (error) {
      console.error(`Error creating raw news:`, error);
      res.status(400).json({ error: 'Invalid raw news data' });
    }
  });

  app.get('/api/raw-news', async (req, res) => {
    try {
      const { status } = req.query;
      if (status !== undefined) {
        const analysisStatus = status === 'true';
        const rawNews = await storage.getRawNewsByStatus(analysisStatus);
        res.json(rawNews);
      } else {
        res.status(400).json({ error: 'Status parameter required' });
      }
    } catch (error) {
      console.error(`Error fetching raw news:`, error);
      res.status(500).json({ error: 'Failed to fetch raw news' });
    }
  });

  app.get('/api/raw-news/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rawNews = await storage.getRawNews(id);
      if (rawNews) {
        res.json(rawNews);
      } else {
        res.status(404).json({ error: 'Raw news not found' });
      }
    } catch (error) {
      console.error(`Error fetching raw news:`, error);
      res.status(500).json({ error: 'Failed to fetch raw news' });
    }
  });

  app.patch('/api/raw-news/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { analysisStatus } = req.body;
      await storage.updateRawNewsStatus(id, analysisStatus);
      res.json({ success: true });
    } catch (error) {
      console.error(`Error updating raw news status:`, error);
      res.status(500).json({ error: 'Failed to update raw news status' });
    }
  });

  // News analysis results routes
  app.post('/api/news-analysis', async (req, res) => {
    try {
      const validatedData = insertNewsAnalysisResultsSchema.parse(req.body);
      const analysis = await storage.createNewsAnalysisResult(validatedData);
      res.json(analysis);
    } catch (error) {
      console.error(`Error creating news analysis:`, error);
      res.status(400).json({ error: 'Invalid news analysis data' });
    }
  });

  app.get('/api/news-analysis/:rawNewsId', async (req, res) => {
    try {
      const rawNewsId = parseInt(req.params.rawNewsId);
      const analyses = await storage.getNewsAnalysisResults(rawNewsId);
      res.json(analyses);
    } catch (error) {
      console.error(`Error fetching news analysis:`, error);
      res.status(500).json({ error: 'Failed to fetch news analysis' });
    }
  });

  // Daily market summary routes
  app.post('/api/daily-summary', async (req, res) => {
    try {
      const validatedData = insertDailyMarketSummarySchema.parse(req.body);
      const summary = await storage.createDailyMarketSummary(validatedData);
      res.json(summary);
    } catch (error) {
      console.error(`Error creating daily summary:`, error);
      res.status(400).json({ error: 'Invalid daily summary data' });
    }
  });

  app.get('/api/daily-summary', async (req, res) => {
    try {
      const { commodity } = req.query;
      const summaries = await storage.getDailyMarketSummaries(commodity as string);
      res.json(summaries);
    } catch (error) {
      console.error(`Error fetching daily summaries:`, error);
      res.status(500).json({ error: 'Failed to fetch daily summaries' });
    }
  });

  app.get('/api/daily-summary/:date/:commodity', async (req, res) => {
    try {
      const { date, commodity } = req.params;
      const summary = await storage.getDailyMarketSummary(date, commodity);
      if (summary) {
        res.json(summary);
      } else {
        res.status(404).json({ error: 'Daily summary not found' });
      }
    } catch (error) {
      console.error(`Error fetching daily summary:`, error);
      res.status(500).json({ error: 'Failed to fetch daily summary' });
    }
  });

  // Price history routes
  app.post('/api/price-history', async (req, res) => {
    try {
      const validatedData = insertPriceHistorySchema.parse(req.body);
      const priceData = await storage.createPriceHistory(validatedData);
      res.json(priceData);
    } catch (error) {
      console.error(`Error creating price history:`, error);
      res.status(400).json({ error: 'Invalid price history data' });
    }
  });

  app.get('/api/price-history/:commodity', async (req, res) => {
    try {
      const { commodity } = req.params;
      const { startDate, endDate } = req.query;
      const priceHistory = await storage.getPriceHistory(
        commodity, 
        startDate as string, 
        endDate as string
      );
      res.json(priceHistory);
    } catch (error) {
      console.error(`Error fetching price history:`, error);
      res.status(500).json({ error: 'Failed to fetch price history' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
