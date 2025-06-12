import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, BarChart3 } from "lucide-react";
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-4 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          시황으로 돌아가기
        </Button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {commodity.name} 상세 정보
        </h2>
        <p className="text-gray-600">실시간 센티먼트 분석 및 시장 동향</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Textual Insights */}
        <div className="space-y-6">
          {/* Latest Sentiment Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">최신 센티먼트 점수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold mb-2 ${getSentimentColor(commodity.sentimentScore)}`}>
                {commodity.sentimentScore}
              </div>
              <p className="text-sm text-gray-600">{getSentimentText(commodity.sentimentScore)}</p>
            </CardContent>
          </Card>

          {/* Key Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">핵심 요약</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  📌 주요 현황 이유
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {commodity.name}의 현재 센티먼트 점수는 {commodity.sentimentScore}로, 
                  {commodity.sentimentScore >= 70 ? ' 매우 긍정적인' : 
                   commodity.sentimentScore >= 50 ? ' 중립적인' : ' 부정적인'} 상황입니다. 
                  주요 키워드들이 시장 심리에 영향을 미치고 있습니다.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  🔑 주요 키워드
                </h4>
                <div className="flex flex-wrap gap-2">
                  {commodity.keywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 px-3 py-1"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* News Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">관련 뉴스</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : news && news.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>뉴스 제목</TableHead>
                      <TableHead>내용 요약</TableHead>
                      <TableHead className="text-center">점수</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {news.map((article) => (
                      <TableRow
                        key={article.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => onNewsSelect(article)}
                      >
                        <TableCell>
                          <p className="font-medium text-gray-900 line-clamp-2">
                            {article.title}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-gray-600 line-clamp-2 text-sm">
                            {article.snippet}
                          </p>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`text-xs font-medium ${getSentimentBgColor(article.sentimentScore)}`}
                          >
                            {article.sentimentScore}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-4">관련 뉴스가 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Charts */}
        <div className="space-y-6">
          {/* Price Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                가격 흐름 (2주)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">가격 추세 차트</p>
                  <p className="text-xs">차트 구현 예정</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Score Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                점수 흐름 (2주)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">센티먼트 점수 차트</p>
                  <p className="text-xs">차트 구현 예정</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
