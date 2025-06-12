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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-4 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          상세 페이지로 돌아가기
        </Button>
      </div>

      {/* News Article */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <header className="mb-6 pb-6 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {news.title}
              </h1>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(news.publishedAt)}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📈 뉴스 점수:</span>
                  <Badge
                    className={`text-xs font-medium ${getSentimentBgColor(news.sentimentScore)}`}
                  >
                    {news.sentimentScore}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">🔑 주요 키워드</h4>
                <div className="flex flex-wrap gap-2">
                  {news.keywords.map((keyword, index) => (
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
            </header>

            <div className="prose max-w-none">
              {news.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-4">
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
