import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, AlertTriangle, TrendingDown, Volume2 } from "lucide-react";
import type { Commodity } from "@shared/schema";

interface MarketOverviewProps {
  onCommoditySelect: (commodity: Commodity) => void;
}

export default function MarketOverview({ onCommoditySelect }: MarketOverviewProps) {
  const { data: commodities, isLoading } = useQuery<Commodity[]>({
    queryKey: ["/api/commodities"]
  });

  const { data: sentimentAlert, isLoading: alertLoading } = useQuery<any>({
    queryKey: ["/api/sentiment-alert"]
  });

  if (isLoading || alertLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 mb-4">
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!commodities || commodities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">상품 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const getCommodityIcon = (name: string) => {
    const getIconStyle = (name: string) => {
      switch (name) {
        case 'WTI유':
          return 'bg-black text-white';
        case '옥수수':
          return 'bg-yellow-400 text-yellow-800';
        case '금':
          return 'bg-yellow-500 text-yellow-900';
        case '구리':
          return 'bg-orange-500 text-orange-900';
        case '밀':
          return 'bg-orange-400 text-orange-800';
        default:
          return 'bg-gray-400 text-gray-800';
      }
    };

    return (
      <div className={`w-12 h-12 flex items-center justify-center rounded-full ${getIconStyle(name)}`}>
        {name === '옥수수' && (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <path d="M12 2C10.5 2 9.2 2.8 8.5 4C7.8 2.8 6.5 2 5 2C3.3 2 2 3.3 2 5V19C2 20.7 3.3 22 5 22C6.5 22 7.8 21.2 8.5 20C9.2 21.2 10.5 22 12 22C13.5 22 14.8 21.2 15.5 20C16.2 21.2 17.5 22 19 22C20.7 22 22 20.7 22 19V5C22 3.3 20.7 2 19 2C17.5 2 16.2 2.8 15.5 4C14.8 2.8 13.5 2 12 2Z"/>
          </svg>
        )}
        {name === '밀' && (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <path d="M12 2L10 6L8 2L6 6L4 2L2 6V20H4L6 16L8 20H10L12 16L14 20H16L18 16L20 20H22V6L20 2L18 6L16 2L14 6Z"/>
          </svg>
        )}
        {name === '구리' && (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 8l8 8m0-8l-8 8" stroke="white" strokeWidth="2"/>
          </svg>
        )}
        {name === 'WTI유' && (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <path d="M12 2C8.5 2 6 4.8 6 8.5C6 12.3 12 20.2 12 20.2S18 12.3 18 8.5C18 4.8 15.5 2 12 2ZM12 11C10.3 11 9 9.7 9 8S10.3 5 12 5S15 6.3 15 8S13.7 11 12 11Z"/>
          </svg>
        )}
        {name === '금' && (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <rect x="4" y="8" width="16" height="8" rx="1"/>
            <rect x="6" y="10" width="12" height="4" rx="0.5"/>
            <rect x="8" y="6" width="8" height="2" rx="1"/>
          </svg>
        )}
      </div>
    );
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return "text-sentiment-positive";
    if (score >= 50) return "text-sentiment-neutral";
    return "text-sentiment-negative";
  };

  const getSentimentBgColor = (score: number) => {
    if (score >= 70) return "bg-sentiment-positive";
    if (score >= 50) return "bg-sentiment-neutral";  
    return "bg-sentiment-negative";
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-sentiment-positive" : "text-sentiment-negative";
  };

  const getChangeSymbol = (change: number) => {
    return change >= 0 ? "▲" : "▼";
  };

  return (
    <div className="space-y-6">
      {/* Sentiment Alert Box */}
      {sentimentAlert && (
        <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Volume2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Sentiment Alert
                  </h3>
                </div>
              </div>
              <Badge className="bg-slate-600 text-slate-200 px-3 py-1 text-sm">
                3d
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">
                  {getCommodityIcon(sentimentAlert.commodity)}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-1">
                    {sentimentAlert.englishName}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg text-red-400">
                      Sentiment <span className="text-red-300 font-semibold">Decreased</span>
                    </span>
                    <span className="text-red-300 text-sm">
                      {Math.abs(sentimentAlert.scoreChange)} pts
                    </span>
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl mb-2">
                  {getCommodityIcon(sentimentAlert.commodity)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest News */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-slate-700 rounded-lg">
          <div className="w-5 h-5 bg-slate-400 rounded-sm flex items-center justify-center">
            <div className="w-3 h-2 bg-slate-200 rounded-sm"></div>
          </div>
        </div>
        <h3 className="text-lg font-medium text-muted-foreground">Latest News</h3>
      </div>

      {/* Commodity Sentiment Scores */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-6">Commodity Sentiment Scores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {commodities.map((commodity) => (
            <Card
              key={commodity.id}
              className="bg-card border-border cursor-pointer hover:bg-secondary/50 transition-all duration-200 rounded-xl overflow-hidden"
              onClick={() => onCommoditySelect(commodity)}
            >
              <CardContent className="p-6">
                {/* Commodity Icon and Name */}
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="mb-3">
                    {getCommodityIcon(commodity.name)}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {commodity.englishName}
                  </h3>
                  
                  {/* Sentiment Score Circle */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 ${getSentimentBgColor(commodity.sentimentScore)}`}>
                    {commodity.sentimentScore}
                  </div>
                </div>
                
                {/* Price Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-foreground">
                      ${commodity.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className={`flex items-center font-semibold ${getChangeColor(commodity.priceChange)}`}>
                      {getChangeSymbol(commodity.priceChange)} {Math.abs(commodity.priceChange)}%
                    </span>
                  </div>
                </div>
                
                {/* Keywords */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">{commodity.keywords.slice(0, 2).join(' ')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
