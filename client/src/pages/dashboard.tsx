import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MarketOverview from "@/components/market-overview";
import CommodityDetail from "@/components/commodity-detail";
import NewsDetail from "@/components/news-detail";
import Chatbot from "@/components/chatbot";
import EmailAlerts from "@/components/email-alerts";
import SentimentAnalysis from "@/components/sentiment-analysis";
import { ChartBar, Bot, Bell, Menu, BarChart3 } from "lucide-react";
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
    { id: 'analysis', label: '분석', icon: BarChart3 },
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
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                <ChartBar className="inline w-5 h-5 text-blue-600 mr-2" />
                Market Sentiment
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {tabConfig.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  onClick={() => setActiveSection(id as ActiveSection)}
                  variant={activeSection === id ? "default" : "ghost"}
                  className="px-4 py-2 font-medium transition-all duration-200"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              ))}
            </nav>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-2">
                {tabConfig.map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    onClick={() => {
                      setActiveSection(id as ActiveSection);
                      setMobileMenuOpen(false);
                    }}
                    variant={activeSection === id ? "default" : "ghost"}
                    className="justify-start px-4 py-3 font-medium transition-all duration-200"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-2 max-w-7xl">
        {renderActiveSection()}
      </main>
    </div>
  );
}
