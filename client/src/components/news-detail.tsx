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
            <header className="mb-4 pb-3 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900 mb-3">
                {news.title}
              </h1>
              
              <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{formatDate(news.publishedAt)}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-1">📈 뉴스 점수:</span>
                  <Badge
                    className={`text-xs font-medium ${getSentimentBgColor(news.sentimentScore)}`}
                  >
                    {news.sentimentScore}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">🔑 주요 키워드</h4>
                <div className="flex flex-wrap gap-1">
                  {news.keywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 text-xs px-2 py-1"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </header>

            <div className="max-h-96 overflow-y-auto">
              {news.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-3 text-sm">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
