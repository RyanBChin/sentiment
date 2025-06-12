import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, AlertTriangle, TrendingDown, AlertCircle } from "lucide-react";
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
    <div className="space-y-8 p-6">
      {/* Sentiment Alert Box */}
      {sentimentAlert && (
        <div className="saas-card bg-gradient-to-r from-primary to-blue-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-white">센티먼트 알림</h3>
              <p className="text-blue-100 text-lg">
                {sentimentAlert.commodity}: 점수 {sentimentAlert.currentScore} 
                <span className={`ml-2 font-semibold ${sentimentAlert.scoreChange >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                  ({sentimentAlert.scoreChange >= 0 ? '+' : ''}{sentimentAlert.scoreChange})
                </span>
              </p>
            </div>
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
        </div>
      )}

      {/* Market Overview Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-dark">시장 현황</h1>
        <Badge className="bg-secondary text-white px-4 py-2 text-sm font-medium">
          실시간 업데이트
        </Badge>
      </div>

      {/* Commodity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {commodities.map((commodity) => (
          <div 
            key={commodity.id} 
            className="saas-card cursor-pointer group"
            onClick={() => onCommoditySelect(commodity)}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-neutral-dark">{commodity.name}</h2>
              <div className={`w-4 h-4 rounded-full ${
                commodity.sentimentScore >= 70 ? 'bg-sentiment-positive' : 
                commodity.sentimentScore >= 50 ? 'bg-warning' : 'bg-sentiment-negative'
              }`}></div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral font-medium">센티먼트 점수</span>
                <span className="text-2xl font-bold text-primary">{commodity.sentimentScore.toFixed(1)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral font-medium">현재가격</span>
                <span className="text-lg font-semibold text-neutral-dark">
                  {commodity.price.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral font-medium">변동률</span>
                <div className="flex items-center">
                  <span className={`text-lg font-bold ${
                    commodity.priceChange >= 0 ? 'text-sentiment-positive' : 'text-sentiment-negative'
                  }`}>
                    {commodity.priceChange >= 0 ? '+' : ''}{commodity.priceChange.toFixed(2)}%
                  </span>
                  {commodity.priceChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 ml-1 text-sentiment-positive" />
                  ) : (
                    <TrendingDown className="w-4 h-4 ml-1 text-sentiment-negative" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-neutral">
              <div className="flex flex-wrap gap-2">
                {commodity.keywords.slice(0, 2).map((keyword, index) => (
                  <span key={index} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
