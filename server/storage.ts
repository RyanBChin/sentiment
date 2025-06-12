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
  type InsertPriceHistory
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
  createNewsAnalysisResult(analysis: InsertNewsAnalysisResults): Promise<NewsAnalysisResults>;
  getNewsAnalysisResults(rawNewsId: number): Promise<NewsAnalysisResults[]>;
  
  // Daily Market Summary - 일별 종합 분석
  createDailyMarketSummary(summary: InsertDailyMarketSummary): Promise<DailyMarketSummary>;
  getDailyMarketSummary(date: string, commodity: string): Promise<DailyMarketSummary | undefined>;
  getDailyMarketSummaries(commodity?: string): Promise<DailyMarketSummary[]>;
  
  // Price History - 가격 데이터
  createPriceHistory(priceData: InsertPriceHistory): Promise<PriceHistory>;
  getPriceHistory(commodity: string, startDate?: string, endDate?: string): Promise<PriceHistory[]>;
  
  // Market Overview Extensions
  getTopGainersLosers(): Promise<any>;
  getLatestNewsFeed(limit?: number): Promise<any[]>;
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
    const commoditiesData: Commodity[] = [
      {
        id: 1,
        name: "옥수수",
        englishName: "Corn",
        sentimentScore: 89.5,
        price: 632.5,
        priceChange: 2.1,
        keywords: ["가뭄", "수출증가", "USDA", "중국수입"]
      },
      {
        id: 2,
        name: "밀",
        englishName: "Wheat",
        sentimentScore: 45.2,
        price: 345.8,
        priceChange: -1.3,
        keywords: ["공급과잉", "수요감소"]
      },
      {
        id: 3,
        name: "구리",
        englishName: "Copper",
        sentimentScore: 76.8,
        price: 8245,
        priceChange: 0.8,
        keywords: ["인프라투자", "전기차"]
      },
      {
        id: 4,
        name: "WTI 원유",
        englishName: "WTI Oil",
        sentimentScore: 58.4,
        price: 78.92,
        priceChange: 0.3,
        keywords: ["OPEC", "재고감소"]
      },
      {
        id: 5,
        name: "금",
        englishName: "Gold",
        sentimentScore: 82.1,
        price: 1945.30,
        priceChange: 1.2,
        keywords: ["안전자산", "인플레이션"]
      }
    ];

    commoditiesData.forEach(commodity => {
      this.commodities.set(commodity.id, commodity);
      this.currentCommodityId = Math.max(this.currentCommodityId, commodity.id + 1);
    });

    // Generate historical data for the last 14 days
    this.generateHistoricalData();

    // Initialize news data
    const newsData: News[] = [
      // Corn news
      {
        id: 1,
        commodityId: 1,
        title: "미국 가뭄이 옥수수 공급량 위협",
        snippet: "중서부 지역의 건조한 기후가 올해 옥수수 수확량에 심각한 영향을 미칠 것으로 예상...",
        content: "미국 중서부 지역에 지속되고 있는 극심한 가뭄으로 인해 올해 옥수수 수확량이 크게 감소할 것으로 예상된다고 농업 전문가들이 경고했다.\n\n아이오와, 일리노이, 네브라스카 등 주요 옥수수 생산 주에서는 지난 3개월간 평년 대비 60% 이하의 강수량을 기록했다. 특히 옥수수 수분 시기인 7-8월에 지속된 고온건조 날씨는 작물 생육에 치명적인 영향을 미치고 있다.\n\n현지 농민들은 관개 시설 확충에 나서고 있지만, 지하수 고갈과 높은 에너지 비용으로 어려움을 겪고 있다. 업계에서는 올해 옥수수 생산량이 전년 대비 15-20% 감소할 것으로 전망하고 있다.",
        sentimentScore: 82.3,
        keywords: ["가뭄", "수확량", "중서부", "생산감소"],
        publishedAt: new Date("2024-01-15T09:00:00Z")
      },
      {
        id: 2,
        commodityId: 1,
        title: "옥수수 수출 수요 급증세",
        snippet: "동남아시아의 강력한 수요로 미국 옥수수 수출이 상승세를 이어가고 있어...",
        content: "동남아시아 국가들의 강력한 수요에 힘입어 미국 옥수수 수출이 급증하고 있다. 미국 농무부 발표에 따르면 지난달 옥수수 수출량은 전년 동월 대비 35% 증가한 것으로 나타났다.\n\n특히 베트남, 태국, 인도네시아 등 동남아 주요국들이 사료용 옥수수 수요 증가로 미국산 옥수수 구매를 늘리고 있다. 이들 국가의 축산업 성장과 경제 발전이 수요 증가의 주요 배경으로 분석된다.\n\n수출업체들은 높은 수요로 인해 선적 대기 시간이 길어지고 있다고 밝혔다. 업계에서는 이러한 수출 호조가 당분간 지속될 것으로 전망하고 있다.",
        sentimentScore: 75.6,
        keywords: ["수출", "동남아시아", "수요증가", "사료용"],
        publishedAt: new Date("2024-01-14T14:30:00Z")
      },
      {
        id: 3,
        commodityId: 1,
        title: "중국의 대규모 옥수수 구매 계약",
        snippet: "중국이 미국으로부터 대규모 옥수수 구매 계약을 체결하며 시장에 긍정적 신호...",
        content: "중국이 미국으로부터 500만 톤 규모의 대규모 옥수수 구매 계약을 체결했다고 양국 무역당국이 발표했다. 이는 올해 들어 가장 큰 규모의 단일 거래로 기록된다.\n\n이번 계약은 중국의 돼지 사육두수 회복과 사료 수요 증가를 반영한 것으로 분석된다. 아프리카돼지열병으로 크게 위축되었던 중국 양돈업이 정상화되면서 옥수수 수요가 급증하고 있다.\n\n시장 전문가들은 이번 대규모 구매가 향후 옥수수 가격 상승을 견인할 중요한 요인이 될 것이라고 평가했다. 특히 공급 부족 우려가 커지는 상황에서 추가적인 가격 상승 압력으로 작용할 것으로 예상된다.",
        sentimentScore: 88.7,
        keywords: ["중국구매", "대규모계약", "돼지사육", "가격상승"],
        publishedAt: new Date("2024-01-13T16:45:00Z")
      },
      // Wheat news
      {
        id: 4,
        commodityId: 2,
        title: "글로벌 밀 공급 과잉 우려 심화",
        snippet: "주요 생산국들의 풍작으로 밀 공급 과잉이 예상되며 가격 하락 압력 증가...",
        content: "러시아, 우크라이나, 호주 등 주요 밀 생산국들의 예상보다 좋은 수확량으로 인해 글로벌 밀 공급 과잉 우려가 커지고 있다.\n\n국제곡물협의회(IGC)는 이번 시즌 세계 밀 생산량을 7억 8천만 톤으로 상향 조정했다고 발표했다. 이는 이전 전망치보다 1,500만 톤 증가한 수치다.\n\n특히 러시아의 밀 생산량이 예상을 크게 웃돌면서 국제 밀 가격에 하락 압력을 가하고 있다. 업계에서는 이러한 공급 증가 추세가 내년까지 이어질 것으로 전망하고 있다.",
        sentimentScore: 35.8,
        keywords: ["공급과잉", "풍작", "가격하락", "생산증가"],
        publishedAt: new Date("2024-01-15T11:20:00Z")
      },
      {
        id: 5,
        commodityId: 2,
        title: "밀 수요 감소로 재고 증가",
        snippet: "경기 둔화와 대체 곡물 선호로 밀 수요가 감소하며 재고 수준이 상승...",
        content: "글로벌 경기 둔화와 소비자들의 대체 곡물 선호 증가로 밀 수요가 감소하고 있어 재고 수준이 높아지고 있다.\n\n주요 수입국들이 구매량을 줄이고 있으며, 특히 아프리카와 중동 지역의 구매 감소가 두드러지고 있다. 이들 지역의 경제적 어려움과 환율 변동이 주요 원인으로 지목된다.\n\n또한 옥수수와 쌀 등 대체 곡물에 대한 선호도 증가도 밀 수요 감소의 한 요인으로 작용하고 있다. 영양학적 다양성을 추구하는 소비 트렌드 변화가 영향을 미치고 있다는 분석이다.",
        sentimentScore: 28.4,
        keywords: ["수요감소", "재고증가", "경기둔화", "대체곡물"],
        publishedAt: new Date("2024-01-14T09:15:00Z")
      },
      // Copper news  
      {
        id: 6,
        commodityId: 3,
        title: "전기차 산업 성장으로 구리 수요 급증",
        snippet: "전 세계 전기차 판매 증가와 배터리 기술 발전이 구리 수요를 크게 늘리고 있어...",
        content: "전 세계적으로 전기차 산업이 급속히 성장하면서 구리 수요가 급증하고 있다. 전기차 한 대에는 일반 내연기관 차량보다 3-4배 많은 구리가 사용되기 때문이다.\n\n국제에너지기구(IEA)에 따르면 올해 전기차 판매량은 전년 대비 40% 증가할 것으로 예상된다. 특히 중국과 유럽에서의 전기차 보급 확산이 구리 수요를 견인하고 있다.\n\n또한 충전 인프라 구축도 구리 수요 증가의 주요 요인이다. 급속충전기와 전력망 확충에 대량의 구리가 필요하며, 각국 정부의 친환경 정책이 이러한 투자를 가속화하고 있다.",
        sentimentScore: 84.2,
        keywords: ["전기차", "배터리", "충전인프라", "친환경"],
        publishedAt: new Date("2024-01-15T14:30:00Z")
      },
      {
        id: 7,
        commodityId: 3,
        title: "인프라 투자 확대로 구리 전망 밝아",
        snippet: "각국의 인프라 투자 확대 정책이 구리 수요에 긍정적 영향을 미치고 있어...",
        content: "미국의 인프라 투자법과 중국의 신인프라 정책 등으로 인해 구리 수요 전망이 밝아지고 있다. 전력망 현대화와 5G 네트워크 구축에 대량의 구리가 필요하기 때문이다.\n\n미국 정부는 향후 5년간 1조 2천억 달러를 인프라에 투자할 계획을 발표했으며, 이 중 상당 부분이 전력 및 통신 인프라에 할당될 예정이다.\n\n업계 전문가들은 이러한 대규모 투자가 구리 시장에 장기적으로 긍정적인 영향을 미칠 것이라고 전망했다. 특히 재생에너지 발전과 스마트그리드 구축이 구리 수요를 지속적으로 늘릴 것으로 예상된다.",
        sentimentScore: 79.6,
        keywords: ["인프라투자", "5G네트워크", "전력망", "스마트그리드"],
        publishedAt: new Date("2024-01-14T16:45:00Z")
      },
      // WTI Oil news
      {
        id: 8,
        commodityId: 4,
        title: "OPEC+ 감산 정책으로 유가 상승 압력",
        snippet: "OPEC+의 지속적인 감산 정책이 국제 유가에 상승 압력을 가하고 있어...",
        content: "석유수출국기구(OPEC)와 러시아 등 비OPEC 주요 산유국들이 참여하는 OPEC+가 감산 정책을 연장하기로 결정하면서 국제 유가에 상승 압력이 가해지고 있다.\n\nOPEC+는 최근 회의에서 일일 200만 배럴 감산을 3개월 더 연장하기로 합의했다. 이는 유가 안정을 위한 조치로, 회원국들의 재정 건전성 확보가 주요 목적이다.\n\n시장에서는 이러한 공급 제한이 유가 상승을 견인할 것으로 보고 있으나, 경기 둔화 우려로 인한 수요 감소 가능성도 함께 고려해야 한다는 분석이 나오고 있다.",
        sentimentScore: 65.3,
        keywords: ["OPEC", "감산정책", "공급제한", "유가상승"],
        publishedAt: new Date("2024-01-15T10:00:00Z")
      },
      {
        id: 9,
        commodityId: 4,
        title: "미국 원유 재고 감소로 유가 지지",
        snippet: "미국 원유 재고가 예상보다 크게 감소하며 WTI 유가에 긍정적 영향...",
        content: "미국 에너지정보청(EIA) 발표에 따르면 지난주 미국 원유 재고가 예상치를 크게 웃도는 800만 배럴 감소했다. 이는 시장 예상치인 200만 배럴 감소를 훨씬 상회하는 수준이다.\n\n재고 감소의 주요 원인은 정제소 가동률 증가와 수출 확대로 분석된다. 특히 여름 드라이빙 시즌을 앞두고 휘발유 수요가 증가하면서 정제소들이 가동률을 높인 것이 주효했다.\n\n이러한 재고 감소는 WTI 유가 상승을 뒷받침하는 요인으로 작용하고 있으며, 단기적으로 유가 상승세가 지속될 것이라는 전망이 우세하다.",
        sentimentScore: 58.7,
        keywords: ["원유재고", "재고감소", "정제소", "수요증가"],
        publishedAt: new Date("2024-01-14T08:30:00Z")
      },
      // Gold news
      {
        id: 10,
        commodityId: 5,
        title: "인플레이션 우려로 금 투자 수요 증가",
        snippet: "지속되는 인플레이션 압력과 경기 불확실성이 안전자산인 금에 대한 투자 수요를 늘리고 있어...",
        content: "지속되는 인플레이션 우려와 경기 불확실성으로 인해 안전자산인 금에 대한 투자 수요가 크게 증가하고 있다.\n\n세계금협회(WGC)에 따르면 지난 분기 금 ETF 유입량이 전 분기 대비 150% 증가했다. 특히 개인 투자자들의 금 구매가 급증하면서 현물 금 거래량도 크게 늘었다.\n\n전문가들은 중앙은행들의 통화정책 불확실성과 지정학적 리스크 증가가 금 투자 수요를 뒷받침하고 있다고 분석했다. 특히 달러 약세 전망도 금 가격 상승에 긍정적인 요인으로 작용하고 있다.",
        sentimentScore: 86.4,
        keywords: ["인플레이션", "안전자산", "투자수요", "ETF유입"],
        publishedAt: new Date("2024-01-15T13:15:00Z")
      },
      {
        id: 11,
        commodityId: 5,
        title: "중앙은행들의 금 매입 증가세",
        snippet: "전 세계 중앙은행들이 금 보유량을 늘리며 금 시장에 긍정적 영향을 미치고 있어...",
        content: "전 세계 중앙은행들이 외환보유액에서 금의 비중을 늘리고 있어 금 시장에 긍정적인 영향을 미치고 있다.\n\n국제통화기금(IMF) 자료에 따르면 지난해 중앙은행들의 금 순매입량은 650톤으로 10년 만에 최고 수준을 기록했다. 특히 신흥국 중앙은행들의 금 매입이 두드러졌다.\n\n이러한 중앙은행들의 금 매입 증가는 달러 의존도를 줄이고 외환보유액을 다변화하려는 전략의 일환으로 해석된다. 업계에서는 이러한 추세가 중장기적으로 금 가격을 지지할 것으로 전망하고 있다.",
        sentimentScore: 78.9,
        keywords: ["중앙은행", "금매입", "외환보유액", "다변화"],
        publishedAt: new Date("2024-01-13T15:20:00Z")
      }
    ];

    newsData.forEach(newsItem => {
      this.news.set(newsItem.id, newsItem);
      this.currentNewsId = Math.max(this.currentNewsId, newsItem.id + 1);
    });
  }

  private generateHistoricalData() {
    const commodityIds = [1, 2, 3, 4, 5];
    const baseData = {
      1: { basePrice: 600, baseScore: 85 }, // Corn
      2: { basePrice: 340, baseScore: 45 }, // Wheat
      3: { basePrice: 8200, baseScore: 76 }, // Copper
      4: { basePrice: 75, baseScore: 58 }, // WTI
      5: { basePrice: 1940, baseScore: 82 } // Gold
    };

    commodityIds.forEach(commodityId => {
      const history: CommodityHistory[] = [];
      const base = baseData[commodityId as keyof typeof baseData];
      
      for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Generate realistic fluctuations
        const priceFactor = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
        const scoreFactor = 1 + (Math.random() - 0.5) * 0.2; // ±10% variation
        
        const historyItem: CommodityHistory = {
          id: this.currentHistoryId++,
          commodityId,
          date: dateStr,
          price: Number((base.basePrice * priceFactor).toFixed(2)),
          sentimentScore: Number((base.baseScore * scoreFactor).toFixed(1))
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
    return Array.from(this.news.values()).filter(news => news.commodityId === commodityId);
  }

  async getNews(id: number): Promise<News | undefined> {
    return this.news.get(id);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      createdAt: new Date()
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
      createdAt: new Date()
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
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5);
  }

  async getSentimentAlert(): Promise<any> {
    // Calculate sentiment changes over the last 3 days for each commodity
    const alerts = [];
    
    Array.from(this.commodityHistory.entries()).forEach(([commodityId, history]) => {
      if (history.length >= 4) {
        const latest = history[history.length - 1];
        const threeDaysAgo = history[history.length - 4]; // 3 days ago
        const change = latest.sentimentScore - threeDaysAgo.sentimentScore;
        
        const commodity = this.commodities.get(commodityId);
        const news = Array.from(this.news.values()).filter(n => n.commodityId === commodityId);
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
            summary: latestNews?.snippet || `${commodity.name}의 시장 센티먼트가 변화하고 있습니다.`
          });
        }
      }
    });
    
    // Return the commodity with the biggest absolute change
    const biggestChange = alerts.reduce((max, current) => 
      Math.abs(current.scoreChange) > Math.abs(max.scoreChange) ? current : max
    );
    
    return biggestChange;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getCommodities(): Promise<Commodity[]> {
    // Get basic commodity data first
    const commodityList = await db.select().from(commodities).orderBy(commodities.id);
    
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
          const current = parseFloat(previousPrices[0].closingPrice || '0');
          const previous = parseFloat(previousPrices[1].closingPrice || '0');
          priceChange = previous > 0 ? ((current - previous) / previous) * 100 : 0;
        }

        return {
          id: commodity.id,
          name: commodity.name,
          englishName: commodity.englishName,
          sentimentScore: latestSummary ? parseFloat(latestSummary.dailySentimentScore || '0') : commodity.sentimentScore,
          price: latestPrice ? parseFloat(latestPrice.closingPrice || '0') : commodity.price,
          priceChange: parseFloat(priceChange.toFixed(2)),
          keywords: latestSummary?.dailyKeywords 
            ? this.extractKeywords(latestSummary.dailyKeywords)
            : commodity.keywords || ['시장분석', '동향']
        };
      })
    );

    return commoditiesWithData as Commodity[];
  }

  async getCommodity(id: number): Promise<Commodity | undefined> {
    const [commodity] = await db.select().from(commodities).where(eq(commodities.id, id));
    return commodity || undefined;
  }

  async getCommodityHistory(commodityId: number): Promise<CommodityHistory[]> {
    return await db.select().from(commodityHistory).where(eq(commodityHistory.commodityId, commodityId));
  }

  async getSentimentAlert(): Promise<any> {
    // Return a mock sentiment alert for now
    const commodityList = await this.getCommodities();
    if (commodityList.length > 0) {
      const randomCommodity = commodityList[Math.floor(Math.random() * commodityList.length)];
      return {
        commodityId: randomCommodity.id,
        commodity: randomCommodity.name,
        englishName: randomCommodity.englishName,
        currentScore: randomCommodity.sentimentScore,
        scoreChange: Math.floor(Math.random() * 20) - 10,
        timestamp: new Date().toISOString()
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
      .leftJoin(newsAnalysisResults, eq(rawNews.id, newsAnalysisResults.rawNewsId))
      .where(eq(rawNews.commodity, commodity.name))
      .orderBy(desc(rawNews.publishedTime))
      .limit(10);

    return result.map(item => ({
      id: item.id,
      commodityId: commodityId,
      title: item.title || '',
      content: item.content || '',
      snippet: typeof item.content === 'string' ? item.content.substring(0, 100) + '...' : '내용을 불러오는 중...',
      sentimentScore: parseFloat(item.sentimentScore?.toString() || '0'),
      keywords: this.extractKeywords(item.keywords),
      publishedAt: item.publishedAt || new Date(),
    })) as News[];
  }

  private extractKeywords(keywords: any): string[] {
    if (!keywords) return ['분석중'];
    if (typeof keywords === 'object') {
      const allKeywords = [
        ...(keywords.positive || []),
        ...(keywords.negative || []),
        ...(keywords.neutral || []),
        ...(keywords.top_keywords || [])
      ];
      return allKeywords.length > 0 ? allKeywords : ['분석중'];
    }
    return ['분석중'];
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
      .leftJoin(newsAnalysisResults, eq(rawNews.id, newsAnalysisResults.rawNewsId))
      .leftJoin(commodities, eq(rawNews.commodity, commodities.name))
      .where(eq(rawNews.relevantNews, true))
      .orderBy(desc(rawNews.publishedTime))
      .limit(10);

    return result.map(item => ({
      id: item.id,
      commodityId: item.commodityId || 1,
      title: item.title || '',
      content: item.content || '',
      snippet: typeof item.content === 'string' ? item.content.substring(0, 100) + '...' : '내용을 불러오는 중...',
      sentimentScore: parseFloat(item.sentimentScore?.toString() || '0'),
      keywords: this.extractKeywords(item.keywords),
      publishedAt: item.publishedAt || new Date(),
    })) as News[];
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db.insert(chatMessages).values(message).returning();
    return chatMessage;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).orderBy(desc(chatMessages.createdAt));
  }

  async createEmailAlert(alert: InsertEmailAlert): Promise<EmailAlert> {
    const [emailAlert] = await db.insert(emailAlerts).values(alert).returning();
    return emailAlert;
  }

  async getEmailAlerts(): Promise<EmailAlert[]> {
    return await db.select().from(emailAlerts).orderBy(desc(emailAlerts.createdAt));
  }

  // Raw News Methods
  async createRawNews(rawNewsData: InsertRawNews): Promise<RawNews> {
    const [rawNewsItem] = await db.insert(rawNews).values(rawNewsData).returning();
    return rawNewsItem;
  }

  async getRawNews(id: number): Promise<RawNews | undefined> {
    const [rawNewsItem] = await db.select().from(rawNews).where(eq(rawNews.id, id));
    return rawNewsItem || undefined;
  }

  async getRawNewsByStatus(analysisStatus: boolean): Promise<RawNews[]> {
    return await db.select().from(rawNews).where(eq(rawNews.analysisStatus, analysisStatus));
  }

  async updateRawNewsStatus(id: number, analysisStatus: boolean): Promise<void> {
    await db.update(rawNews).set({ analysisStatus }).where(eq(rawNews.id, id));
  }

  // News Analysis Results Methods
  async createNewsAnalysisResult(analysis: InsertNewsAnalysisResults): Promise<NewsAnalysisResults> {
    const [analysisResult] = await db.insert(newsAnalysisResults).values(analysis).returning();
    return analysisResult;
  }

  async getNewsAnalysisResults(rawNewsId: number): Promise<NewsAnalysisResults[]> {
    return await db.select().from(newsAnalysisResults).where(eq(newsAnalysisResults.rawNewsId, rawNewsId));
  }

  // Daily Market Summary Methods
  async createDailyMarketSummary(summary: InsertDailyMarketSummary): Promise<DailyMarketSummary> {
    const [marketSummary] = await db.insert(dailyMarketSummary).values(summary).returning();
    return marketSummary;
  }

  async getDailyMarketSummary(date: string, commodity: string): Promise<DailyMarketSummary | undefined> {
    const [summary] = await db.select().from(dailyMarketSummary)
      .where(and(eq(dailyMarketSummary.date, date), eq(dailyMarketSummary.commodity, commodity)));
    return summary || undefined;
  }

  async getDailyMarketSummaries(commodity?: string): Promise<DailyMarketSummary[]> {
    if (commodity) {
      return await db.select().from(dailyMarketSummary)
        .where(eq(dailyMarketSummary.commodity, commodity))
        .orderBy(desc(dailyMarketSummary.date));
    }
    return await db.select().from(dailyMarketSummary).orderBy(desc(dailyMarketSummary.date));
  }

  // Price History Methods
  async createPriceHistory(priceData: InsertPriceHistory): Promise<PriceHistory> {
    const [priceHistoryItem] = await db.insert(priceHistory).values(priceData).returning();
    return priceHistoryItem;
  }

  async getPriceHistory(commodity: string, startDate?: string, endDate?: string): Promise<PriceHistory[]> {
    return await db.select().from(priceHistory)
      .where(eq(priceHistory.commodity, commodity))
      .orderBy(desc(priceHistory.date));
  }

  async getTopGainersLosers(): Promise<any> {
    // Get latest 7 days of price data for all commodities
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const priceData = await db
      .select()
      .from(priceHistory)
      .where(gte(priceHistory.date, sevenDaysAgo.toISOString().split('T')[0]))
      .orderBy(priceHistory.commodity, desc(priceHistory.date));

    // Calculate percentage changes
    const commodityChanges = new Map();
    
    for (const record of priceData) {
      const price = parseFloat(record.closingPrice || '0');
      if (!commodityChanges.has(record.commodity)) {
        commodityChanges.set(record.commodity, {
          commodity: record.commodity,
          latest: price,
          oldest: price,
          latestDate: record.date,
          oldestDate: record.date
        });
      } else {
        const existing = commodityChanges.get(record.commodity);
        if (record.date > existing.latestDate) {
          existing.latest = price;
          existing.latestDate = record.date;
        }
        if (record.date < existing.oldestDate) {
          existing.oldest = price;
          existing.oldestDate = record.date;
        }
      }
    }

    // Calculate percentage changes and sort
    const changes = Array.from(commodityChanges.values()).map(item => ({
      commodity: item.commodity,
      change: ((item.latest - item.oldest) / item.oldest) * 100,
      emoji: this.getCommodityEmoji(item.commodity)
    }));

    changes.sort((a, b) => b.change - a.change);

    return {
      gainers: changes.filter(c => c.change > 0).slice(0, 3),
      losers: changes.filter(c => c.change < 0).slice(-3).reverse()
    };
  }

  async getLatestNewsFeed(limit = 10): Promise<any[]> {
    const newsData = await db
      .select({
        id: rawNews.id,
        title: rawNews.title,
        publishedAt: rawNews.publishedTime,
        commodity: rawNews.commodity
      })
      .from(rawNews)
      .orderBy(desc(rawNews.publishedTime))
      .limit(limit);

    return newsData.map(news => ({
      ...news,
      emoji: this.getCommodityEmoji(news.commodity || ''),
      timeAgo: this.getTimeAgo(news.publishedAt?.toString() || new Date().toISOString())
    }));
  }

  private getCommodityEmoji(commodity: string): string {
    const emojiMap: { [key: string]: string } = {
      'corn': '🌽',
      'wheat': '🌾', 
      'copper': '🥉',
      'wti_oil': '🛢️',
      'gold': '🥇',
      '옥수수': '🌽',
      '밀': '🌾',
      '구리': '🥉',
      'WTI 오일': '🛢️',
      '금': '🥇'
    };
    return emojiMap[commodity] || '📈';
  }

  private getTimeAgo(publishedAt: string): string {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now.getTime() - published.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
  }
}

export const storage = new DatabaseStorage();
