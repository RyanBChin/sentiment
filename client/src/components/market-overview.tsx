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
    return (
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg">
        {name === '옥수수' && (
          <svg viewBox="0 0 64 64" className="w-10 h-10 text-yellow-400 fill-current">
            <path d="M32 8c-8 0-12 8-12 16v24c0 8 4 8 12 8s12 0 12-8V24c0-8-4-16-12-16z"/>
            <path d="M28 16h8v32h-8z" className="text-yellow-300 fill-current"/>
          </svg>
        )}
        {name === '밀' && (
          <svg viewBox="0 0 64 64" className="w-10 h-10 text-amber-400 fill-current">
            <path d="M32 8l-4 8-4-4-4 8-4-4v32c0 4 4 8 8 8h8c4 0 8-4 8-8V16l-4 4-4-8z"/>
          </svg>
        )}
        {name === '구리' && (
          <svg viewBox="0 0 64 64" className="w-10 h-10 text-orange-500 fill-current">
            <circle cx="32" cy="32" r="20"/>
            <circle cx="32" cy="32" r="12" className="text-orange-400 fill-current"/>
          </svg>
        )}
        {name === 'WTI유' && (
          <svg viewBox="0 0 64 64" className="w-10 h-10 text-gray-700 fill-current">
            <rect x="20" y="16" width="24" height="32" rx="2"/>
            <rect x="18" y="20" width="28" height="4" className="text-gray-600 fill-current"/>
            <rect x="18" y="28" width="28" height="4" className="text-gray-600 fill-current"/>
            <rect x="18" y="36" width="28" height="4" className="text-gray-600 fill-current"/>
            <text x="32" y="34" textAnchor="middle" className="text-white text-xs font-bold fill-current">OIL</text>
          </svg>
        )}
        {name === '금' && (
          <svg viewBox="0 0 64 64" className="w-10 h-10 text-yellow-500 fill-current">
            <rect x="16" y="24" width="32" height="16" rx="2"/>
            <rect x="20" y="28" width="24" height="8" className="text-yellow-400 fill-current"/>
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
