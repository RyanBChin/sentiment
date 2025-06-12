import { 
  commodities, 
  news, 
  chatMessages, 
  emailAlerts,
  type Commodity, 
  type News, 
  type ChatMessage, 
  type EmailAlert,
  type InsertCommodity,
  type InsertNews,
  type InsertChatMessage,
  type InsertEmailAlert
} from "@shared/schema";

export interface IStorage {
  // Commodities
  getCommodities(): Promise<Commodity[]>;
  getCommodity(id: number): Promise<Commodity | undefined>;
  
  // News
  getNewsByCommodity(commodityId: number): Promise<News[]>;
  getNews(id: number): Promise<News | undefined>;
  
  // Chat
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(): Promise<ChatMessage[]>;
  
  // Email Alerts
  createEmailAlert(alert: InsertEmailAlert): Promise<EmailAlert>;
  getEmailAlerts(): Promise<EmailAlert[]>;
}

export class MemStorage implements IStorage {
  private commodities: Map<number, Commodity>;
  private news: Map<number, News>;
  private chatMessages: Map<number, ChatMessage>;
  private emailAlerts: Map<number, EmailAlert>;
  private currentCommodityId: number;
  private currentNewsId: number;
  private currentChatId: number;
  private currentAlertId: number;

  constructor() {
    this.commodities = new Map();
    this.news = new Map();
    this.chatMessages = new Map();
    this.emailAlerts = new Map();
    this.currentCommodityId = 1;
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

    // Initialize news data
    const newsData: News[] = [
      {
        id: 1,
        commodityId: 1,
        title: "미국 옥수수 생산량, 가뭄으로 10% 감소 전망",
        snippet: "USDA는 올해 옥수수 생산량이 전년 대비 10% 감소할 것으로 전망한다고 발표...",
        content: "미국 농무부(USDA)는 14일 발표한 월간 공급수요 전망 보고서에서 올해 미국 옥수수 생산량이 전년 대비 약 10% 감소할 것으로 예상된다고 밝혔다. 이는 주요 옥수수 생산 지역인 중서부 일대에 지속되고 있는 극심한 가뭄 때문으로 분석된다.\n\nUSDA는 2024년 옥수수 생산량을 137억 부셸로 전망했다고 발표했다. 이는 지난해 실제 생산량 152억 부셸보다 15억 부셸 감소한 수준이다. 특히 아이오와, 일리노이, 인디애나 등 주요 옥수수 벨트 지역의 생산량 감소가 전체 감소폭을 주도하고 있다.\n\n기상청에 따르면 올해 여름 중서부 지역의 강수량은 평년 대비 40% 부족한 상황이다. 특히 옥수수 생육에 중요한 7-8월 기간 동안 지속된 고온건조 날씨가 수확량 감소의 주요 원인으로 지목되고 있다.",
        sentimentScore: 85.2,
        keywords: ["가뭄", "USDA", "생산감소", "가격상승"],
        publishedAt: new Date("2024-01-15T09:00:00Z")
      },
      {
        id: 2,
        commodityId: 1,
        title: "중국, 미국산 옥수수 수입량 50% 증가",
        snippet: "중국이 돼지열병 회복과 사료 수요 증가로 미국산 옥수수 수입을 대폭 늘리고 있어...",
        content: "중국이 아프리카돼지열병(ASF) 회복에 따른 사료용 옥수수 수요 증가로 미국산 옥수수 수입을 대폭 늘리고 있다는 분석이 나왔다.\n\n중국 해관총서에 따르면 올해 1-11월 중국의 미국산 옥수수 수입량은 전년 동기 대비 52% 증가한 2,847만 톤을 기록했다. 이는 중국의 전체 옥수수 수입량의 70%에 해당하는 수준이다.\n\n업계 전문가들은 중국의 돼지 사육두수가 아프리카돼지열병 이전 수준을 회복하면서 사료용 옥수수 수요가 급증했다고 분석했다. 또한 중국 내 옥수수 생산량 부족도 수입 증가의 주요 원인으로 지목되고 있다.",
        sentimentScore: 78.9,
        keywords: ["중국수입", "사료수요", "돼지열병", "수출증가"],
        publishedAt: new Date("2024-01-14T14:30:00Z")
      },
      {
        id: 3,
        commodityId: 1,
        title: "시카고 상품거래소 옥수수 선물 급등",
        snippet: "날씨 우려와 수출 수요 증가로 옥수수 선물가격이 3개월 최고치를 기록...",
        content: "시카고 상품거래소(CBOT)에서 옥수수 선물가격이 날씨 우려와 수출 수요 증가로 3개월 만에 최고치를 기록했다.\n\n3월물 옥수수 선물은 전 거래일 대비 3.2% 상승한 부셸당 4.85달러에 거래를 마감했다. 이는 지난 10월 이후 최고 수준이다.\n\n트레이더들은 미국 중서부 지역의 가뭄 지속과 중국의 대규모 수입 계약이 가격 상승을 견인했다고 분석했다. 특히 USDA의 생산량 전망치 하향 조정이 시장 심리를 크게 개선시켰다는 평가다.",
        sentimentScore: 91.4,
        keywords: ["선물가격", "CBOT", "거래량증가", "시장심리"],
        publishedAt: new Date("2024-01-13T16:45:00Z")
      }
    ];

    newsData.forEach(newsItem => {
      this.news.set(newsItem.id, newsItem);
      this.currentNewsId = Math.max(this.currentNewsId, newsItem.id + 1);
    });
  }

  async getCommodities(): Promise<Commodity[]> {
    return Array.from(this.commodities.values());
  }

  async getCommodity(id: number): Promise<Commodity | undefined> {
    return this.commodities.get(id);
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
}

export const storage = new MemStorage();
