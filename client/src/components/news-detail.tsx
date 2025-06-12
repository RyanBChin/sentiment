import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";
import type { News } from "@shared/schema";

interface NewsDetailProps {
  news: News | null;
  onBack: () => void;
}

export default function NewsDetail({ news, onBack }: NewsDetailProps) {
  if (!news) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">뉴스를 선택해주세요.</p>
      </div>
    );
  }

  const getSentimentBgColor = (score: number) => {
    if (score >= 70) return "bg-green-100 text-green-800";
    if (score >= 50) return "bg-gray-100 text-gray-800";
    return "bg-red-100 text-red-800";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          상세 페이지로 돌아가기
        </Button>
      </div>

      {/* News Article */}
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-4">
            <header className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-xl font-bold text-gray-900 flex-1 pr-4">
                  📰 {news.title}
                </h1>
                <Badge
                  className={`text-sm font-bold px-3 py-2 ${getSentimentBgColor(news.sentimentScore)} flex-shrink-0`}
                >
                  📈 {news.sentimentScore}
                </Badge>
              </div>
              
              <div className="flex items-center text-xs text-gray-600 mb-4">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{formatDate(news.publishedAt)}</span>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                  🔑 주요 키워드
                </h4>
                <div className="flex flex-wrap gap-2">
                  {news.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium border border-blue-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </header>

            <div className="prose prose-sm max-w-none">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">📝 뉴스 본문</h4>
                <div className="max-h-80 overflow-y-auto">
                  {news.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed mb-3 text-sm">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
              
              {/* Summary Box */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">📊 시장 영향 요약</h4>
                <p className="text-xs text-yellow-700 leading-relaxed">
                  이 뉴스는 {news.sentimentScore >= 70 ? '긍정적인' : news.sentimentScore >= 50 ? '중립적인' : '부정적인'} 
                  시장 센티먼트를 형성하고 있으며, 관련 상품의 향후 가격 동향에 영향을 미칠 것으로 예상됩니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
