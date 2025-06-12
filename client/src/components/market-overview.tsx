import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Trophy } from "lucide-react";
import type { Commodity } from "@shared/schema";

interface MarketOverviewProps {
  onCommoditySelect: (commodity: Commodity) => void;
}

export default function MarketOverview({ onCommoditySelect }: MarketOverviewProps) {
  const { data: commodities, isLoading } = useQuery<Commodity[]>({
    queryKey: ["/api/commodities"]
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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

  const averageScore = commodities.reduce((sum, c) => sum + c.sentimentScore, 0) / commodities.length;
  const topCommodity = commodities.reduce((max, c) => c.sentimentScore > max.sentimentScore ? c : max);

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
    <div className="space-y-4">
      {/* Summary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              📊 평균 점수
            </CardTitle>
            <Badge variant="secondary" className="text-xs">실시간</Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <div className={`text-2xl font-bold mb-1 ${getSentimentColor(averageScore)}`}>
              {averageScore.toFixed(1)}
            </div>
            <p className="text-xs text-gray-600">전체 상품 평균 센티먼트</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold flex items-center">
              <Trophy className="w-4 h-4 mr-2" />
              🏆 최고 점수 품목
            </CardTitle>
            <Badge variant="secondary" className="text-xs">TOP 1</Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-lg font-bold text-gray-900 mb-1">
              {topCommodity.name}
            </div>
            <div className={`text-lg font-semibold ${getSentimentColor(topCommodity.sentimentScore)}`}>
              {topCommodity.sentimentScore}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Sentiment Cards */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">실시간 시황 점수</h2>
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
