import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, AlertTriangle, TrendingDown } from "lucide-react";
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

      {/* Live Sentiment Cards */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">🗂️ 품목별 시황 점수</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-3">
          {commodities.map((commodity) => (
            <Card
              key={commodity.id}
              className="cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => onCommoditySelect(commodity)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold">
                  {commodity.name}
                </CardTitle>
                <Badge
                  className={`${getSentimentBgColor(commodity.sentimentScore)} text-white px-2 py-1 text-xs font-medium`}
                >
                  {commodity.sentimentScore}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">종가</span>
                  <span className="text-xs font-semibold text-gray-900">
                    ${commodity.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">변동</span>
                  <span className={`text-xs font-semibold ${getChangeColor(commodity.priceChange)}`}>
                    {getChangeSymbol(commodity.priceChange)}{Math.abs(commodity.priceChange)}%
                  </span>
                </div>
                <div className="pt-1 border-t border-gray-100">
                  <p className="text-xs text-gray-600 mb-1">주요 키워드</p>
                  <div className="flex flex-wrap gap-1">
                    {commodity.keywords.slice(0, 2).map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 text-xs px-1 py-0"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
