import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, AlertTriangle, TrendingDown, Calendar, Tag } from "lucide-react";
import type { Commodity, News } from "@shared/schema";

interface MarketOverviewProps {
  onCommoditySelect: (commodity: Commodity) => void;
  onNewsSelect?: (news: News) => void;
}

export default function MarketOverview({ onCommoditySelect, onNewsSelect }: MarketOverviewProps) {
  const { data: commodities, isLoading } = useQuery<Commodity[]>({
    queryKey: ["/api/commodities"]
  });

  const { data: sentimentAlert, isLoading: alertLoading } = useQuery<any>({
    queryKey: ["/api/sentiment-alert"]
  });

  const { data: latestNews, isLoading: newsLoading } = useQuery<News[]>({
    queryKey: ["/api/latest-news"]
  });

  if (isLoading || alertLoading || newsLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 mb-4">
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
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
    <div className="space-y-4">
      {/* Sentiment Alert Box */}
      {sentimentAlert && (
        <div className="mb-4">
          <Card className={`${sentimentAlert.scoreChange >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center">
                {sentimentAlert.scoreChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                )}
                📌 센티먼트 급변 품목 알림
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    📉 {sentimentAlert.commodity} ({sentimentAlert.englishName})
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-sm font-semibold ${sentimentAlert.scoreChange >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                      📊 센티먼트 변동: {sentimentAlert.scoreChange >= 0 ? '+' : ''}{sentimentAlert.scoreChange} pts
                    </span>
                    <span className="text-xs text-gray-600">
                      ({sentimentAlert.from} → {sentimentAlert.to})
                    </span>
                  </div>
                </div>
                <Badge 
                  className={`${sentimentAlert.scoreChange >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'} px-3 py-1`}
                >
                  3일간
                </Badge>
              </div>
              
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  📰 최신 뉴스
                </h4>
                <p className="text-sm font-medium text-gray-800 mb-1">
                  {sentimentAlert.headline}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {sentimentAlert.summary}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Latest News Section */}
      {latestNews && latestNews.length > 0 && (
        <div className="mb-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center">
                📰 최신 뉴스
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {latestNews.slice(0, 4).map((article) => {
                  const getCommodityIcon = (commodityId: number) => {
                    switch(commodityId) {
                      case 1: return "🌽";
                      case 2: return "🌾";
                      case 3: return "🔶";
                      case 4: return "🛢️";
                      case 5: return "🥇";
                      default: return "📈";
                    }
                  };
                  
                  const getSentimentBadgeColor = (score: number) => {
                    if (score >= 70) return "bg-green-100 text-green-800";
                    if (score >= 50) return "bg-gray-100 text-gray-800";
                    return "bg-red-100 text-red-800";
                  };

                  return (
                    <div
                      key={article.id}
                      className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => onNewsSelect && onNewsSelect(article)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 pr-2">
                          {getCommodityIcon(article.commodityId || 1)} {article.title}
                        </h4>
                        <Badge className={`text-xs font-medium ${getSentimentBadgeColor(article.sentimentScore)} flex-shrink-0`}>
                          {article.sentimentScore}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {article.snippet}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {article.keywords.slice(0, 2).map((keyword, index) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{new Date(article.publishedAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
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
