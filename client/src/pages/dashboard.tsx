import { useState } from "react";
import { SaasLayout, SaasHeader, SaasSidebar, SaasMain } from "@/components/ui/saas-layout";
import { SaasButton } from "@/components/ui/saas-button";
import { Badge } from "@/components/ui/badge";
import MarketOverview from "@/components/market-overview";
import CommodityDetail from "@/components/commodity-detail";
import NewsDetail from "@/components/news-detail";
import Chatbot from "@/components/chatbot";
import EmailAlerts from "@/components/email-alerts";
import SentimentAnalysis from "@/components/sentiment-analysis";
import { ChartBar, Bot, Bell, Menu, Search, BarChart3, TrendingUp, ArrowLeft, Home } from "lucide-react";
import type { Commodity, News } from "@shared/schema";

type ActiveSection = 'market' | 'analysis' | 'chatbot' | 'alerts' | 'detail' | 'news';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('market');
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCommoditySelect = (commodity: Commodity) => {
    setSelectedCommodity(commodity);
    setActiveSection('detail');
  };

  const handleNewsSelect = (news: News) => {
    setSelectedNews(news);
    setActiveSection('news');
  };

  const handleBackToMarket = () => {
    setActiveSection('market');
    setSelectedCommodity(null);
  };

  const handleBackToDetail = () => {
    setActiveSection('detail');
    setSelectedNews(null);
  };

  const tabConfig = [
    { id: 'market', label: '시황', icon: ChartBar },
    { id: 'analysis', label: '분석', icon: Search },
    { id: 'chatbot', label: '챗봇', icon: Bot },
    { id: 'alerts', label: '알림 설정', icon: Bell }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'market':
        return <MarketOverview onCommoditySelect={handleCommoditySelect} />;
      case 'analysis':
        return <SentimentAnalysis />;
      case 'detail':
        return (
          <CommodityDetail
            commodity={selectedCommodity}
            onBack={handleBackToMarket}
            onNewsSelect={handleNewsSelect}
          />
        );
      case 'news':
        return (
          <NewsDetail
            news={selectedNews}
            onBack={handleBackToDetail}
          />
        );
      case 'chatbot':
        return <Chatbot />;
      case 'alerts':
        return <EmailAlerts />;
      default:
        return <MarketOverview onCommoditySelect={handleCommoditySelect} />;
    }
  };

  return (
    <SaasLayout>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Navigation */}
        <SaasSidebar>
          <div className="p-6">
            <div className="flex items-center mb-8">
              <BarChart3 className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-xl font-bold text-neutral-dark">Market Sentiment</h1>
            </div>
            
            <nav className="space-y-2">
              {tabConfig.map(({ id, label, icon: Icon }) => (
                <SaasButton
                  key={id}
                  onClick={() => setActiveSection(id as ActiveSection)}
                  variant={activeSection === id ? "primary" : "secondary"}
                  className={`w-full justify-start px-4 py-3 font-medium transition-all ${
                    activeSection === id ? '' : 'bg-transparent hover:bg-neutral-light text-neutral-dark'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {label}
                </SaasButton>
              ))}
            </nav>
            
            {/* Back Navigation */}
            {(activeSection === 'detail' || activeSection === 'news') && (
              <div className="mt-6 pt-6 border-t border-neutral">
                <SaasButton
                  onClick={() => {
                    if (activeSection === 'news') {
                      handleBackToDetail();
                    } else {
                      handleBackToMarket();
                    }
                  }}
                  variant="secondary"
                  className="w-full justify-start px-4 py-3 bg-transparent hover:bg-neutral-light text-neutral-dark"
                >
                  <ArrowLeft className="w-5 h-5 mr-3" />
                  {activeSection === 'news' ? '상세로 돌아가기' : '시장으로 돌아가기'}
                </SaasButton>
              </div>
            )}
          </div>
        </SaasSidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <SaasHeader>
            <div className="flex items-center">
              <Home className="w-5 h-5 text-primary mr-2" />
              <span className="text-lg font-semibold text-neutral-dark">
                {activeSection === 'market' && '시장 현황'}
                {activeSection === 'analysis' && '센티먼트 분석'}
                {activeSection === 'chatbot' && 'AI 챗봇'}
                {activeSection === 'alerts' && '알림 설정'}
                {activeSection === 'detail' && `${selectedCommodity?.name} 상세`}
                {activeSection === 'news' && '뉴스 상세'}
              </span>
            </div>
            <Badge variant="secondary" className="bg-secondary text-white">
              실시간
            </Badge>
          </SaasHeader>

          <SaasMain className="overflow-auto">
            {renderActiveSection()}
          </SaasMain>
        </div>
      </div>
    </SaasLayout>
  );
}
