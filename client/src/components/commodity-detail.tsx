import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, BarChart3 } from "lucide-react";
import CommodityChart from "@/components/commodity-chart";
import type { Commodity, News } from "@shared/schema";

interface CommodityDetailProps {
  commodity: Commodity | null;
  onBack: () => void;
  onNewsSelect: (news: News) => void;
}

export default function CommodityDetail({ commodity, onBack, onNewsSelect }: CommodityDetailProps) {
  const { data: news, isLoading } = useQuery<News[]>({
    queryKey: ["/api/commodities", commodity?.id, "news"],
    enabled: !!commodity?.id
  });

  if (!commodity) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">상품을 선택해주세요.</p>
      </div>
    );
  }

  const getSentimentColor = (score: number) => {
    if (score >= 70) return "text-sentiment-positive";
    if (score >= 50) return "text-sentiment-neutral";
    return "text-sentiment-negative";
  };

  const getSentimentText = (score: number) => {
    if (score >= 70) return "매우 긍정적";
    if (score >= 50) return "중립적";
    return "부정적";
  };

  const getSentimentBgColor = (score: number) => {
    if (score >= 70) return "bg-green-100 text-green-800";
    if (score >= 50) return "bg-gray-100 text-gray-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="h-screen overflow-hidden p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            뒤로
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {commodity.name} 상세 분석
          </h1>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-2 gap-6 h-[calc(100vh-120px)]">
        
        {/* Left Column */}
        <div className="flex flex-col space-y-4">
          
          {/* Top Left - Combined Sentiment + Market Metrics */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">📊 센티먼트 & 시장 지표</CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="grid grid-cols-2 gap-6">
                
                {/* Sentiment Score */}
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: getSentimentColor(commodity.sentimentScore) }}>
                    {commodity.sentimentScore}
                  </div>
                  <Badge
                    className={`${getSentimentBgColor(commodity.sentimentScore)} text-white px-4 py-2 text-sm font-medium`}
                  >
                    {getSentimentText(commodity.sentimentScore)}
                  </Badge>
                </div>

                {/* Market Metrics */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">현재 가격</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${commodity.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">일일 변동률</span>
                    <span className={`text-lg font-bold ${commodity.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {commodity.priceChange >= 0 ? '▲' : '▼'} {Math.abs(commodity.priceChange).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">센티먼트 점수</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {commodity.sentimentScore}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Left - Chart */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">📈 가격 & 센티먼트 추이 (2주)</CardTitle>
            </CardHeader>
            <CardContent className="pt-1 h-[calc(100%-80px)]">
              <div className="h-full">
                <CommodityChart 
                  commodityId={commodity.id} 
                  commodityName={commodity.name}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col space-y-4">
          
          {/* Top Right - Key Summary */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">🧠 핵심 요약</CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">주요 현황 이유</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {commodity.name}의 현재 센티먼트 점수는 {commodity.sentimentScore}로, 
                    {commodity.sentimentScore >= 70 ? ' 매우 긍정적인' : 
                     commodity.sentimentScore >= 50 ? ' 중립적인' : ' 부정적인'} 상황입니다.
                    시장 동향과 글로벌 경제 지표가 주요 영향 요인으로 작용하고 있습니다.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">주요 키워드</h4>
                  <div className="flex flex-wrap gap-2">
                    {commodity.keywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 font-medium"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Right - Related News */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">📰 관련 뉴스</CardTitle>
            </CardHeader>
            <CardContent className="pt-1 h-[calc(100%-80px)]">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : news && news.length > 0 ? (
                <div className="h-full overflow-y-auto space-y-3">
                  {news.map((article) => (
                    <div
                      key={article.id}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                      onClick={() => onNewsSelect(article)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 pr-3">
                          {article.title}
                        </h4>
                        <Badge
                          className={`text-xs font-medium ${getSentimentBgColor(article.sentimentScore)} flex-shrink-0`}
                        >
                          {article.sentimentScore}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                        {article.snippet}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {article.keywords.slice(0, 3).map((keyword, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-center">관련 뉴스가 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
