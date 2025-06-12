import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, BarChart3, Eye } from "lucide-react";

interface FitScoreData {
  id: number;
  name: string;
  englishName: string;
  fitScore: number;
  matchDays: number;
  totalDays: number;
  correlation: number;
  evaluation: string;
  recentTrend: 'up' | 'down' | 'stable';
  details: {
    weeklyScores: number[];
    matchingDates: string[];
    nonMatchingDates: string[];
    explanation: string;
  };
}

export default function SentimentAnalysis() {
  const [selectedCommodity, setSelectedCommodity] = useState<FitScoreData | null>(null);

  const fitScoreData: FitScoreData[] = [
    {
      id: 1,
      name: "옥수수",
      englishName: "Corn",
      fitScore: 81,
      matchDays: 11,
      totalDays: 14,
      correlation: 0.83,
      evaluation: "높음",
      recentTrend: "up",
      details: {
        weeklyScores: [75, 78, 81, 85],
        matchingDates: ["12/01", "12/02", "12/04", "12/05", "12/06", "12/08", "12/09", "12/11", "12/12", "12/13", "12/14"],
        nonMatchingDates: ["12/03", "12/07", "12/10"],
        explanation: "미국 중서부 가뭄과 중국 수입 증가로 인한 가격 상승이 부정적 센티먼트와 일치하여 높은 적합도를 보임"
      }
    },
    {
      id: 2,
      name: "밀",
      englishName: "Wheat",
      fitScore: 75,
      matchDays: 9,
      totalDays: 14,
      correlation: 0.65,
      evaluation: "보통",
      recentTrend: "stable",
      details: {
        weeklyScores: [70, 72, 75, 78],
        matchingDates: ["12/01", "12/04", "12/05", "12/08", "12/09", "12/11", "12/12", "12/13", "12/14"],
        nonMatchingDates: ["12/02", "12/03", "12/06", "12/07", "12/10"],
        explanation: "우크라이나 수출 재개와 인도 수출 금지 정책이 상충되어 중간 수준의 센티먼트-가격 일치율을 기록"
      }
    },
    {
      id: 3,
      name: "구리",
      englishName: "Copper", 
      fitScore: 90,
      matchDays: 13,
      totalDays: 14,
      correlation: 0.91,
      evaluation: "매우 높음",
      recentTrend: "up",
      details: {
        weeklyScores: [85, 87, 90, 93],
        matchingDates: ["12/01", "12/02", "12/03", "12/04", "12/05", "12/06", "12/08", "12/09", "12/10", "12/11", "12/12", "12/13", "12/14"],
        nonMatchingDates: ["12/07"],
        explanation: "전기차 수요 급증과 중국 인프라 투자 확대가 긍정적 센티먼트와 가격 상승을 동시에 견인하여 매우 높은 일치율 달성"
      }
    },
    {
      id: 4,
      name: "WTI 원유",
      englishName: "WTI Oil",
      fitScore: 78,
      matchDays: 10,
      totalDays: 14,
      correlation: 0.72,
      evaluation: "높음",
      recentTrend: "up",
      details: {
        weeklyScores: [72, 75, 78, 80],
        matchingDates: ["12/01", "12/02", "12/04", "12/05", "12/08", "12/09", "12/11", "12/12", "12/13", "12/14"],
        nonMatchingDates: ["12/03", "12/06", "12/07", "12/10"],
        explanation: "OPEC+ 감산 연장과 미국 재고 감소가 긍정적 센티먼트와 가격 상승으로 이어져 양호한 적합도를 기록"
      }
    },
    {
      id: 5,
      name: "금",
      englishName: "Gold",
      fitScore: 84,
      matchDays: 12,
      totalDays: 14,
      correlation: 0.78,
      evaluation: "높음",
      recentTrend: "up",
      details: {
        weeklyScores: [80, 82, 84, 86],
        matchingDates: ["12/01", "12/02", "12/03", "12/05", "12/06", "12/08", "12/09", "12/10", "12/11", "12/12", "12/13", "12/14"],
        nonMatchingDates: ["12/04", "12/07"],
        explanation: "연준 금리 인하 기대감과 달러 약세가 긍정적 센티먼트와 금값 상승을 동조화시켜 높은 적합도 실현"
      }
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-sentiment-positive";
    if (score >= 70) return "text-blue-400";
    if (score >= 60) return "text-yellow-400";
    return "text-sentiment-negative";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return "bg-sentiment-positive text-white";
    if (score >= 70) return "bg-blue-600 text-white";
    if (score >= 60) return "bg-yellow-600 text-white";
    return "bg-sentiment-negative text-white";
  };

  const getEvaluationColor = (evaluation: string) => {
    switch (evaluation) {
      case "매우 높음": return "bg-sentiment-positive text-white";
      case "높음": return "bg-blue-600 text-white";
      case "보통": return "bg-yellow-600 text-white";
      default: return "bg-sentiment-negative text-white";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Sentiment-Price Fit Score 분석</h1>
        <p className="text-muted-foreground">품목별 센티먼트 점수와 실제 가격 변동의 일치율을 분석합니다</p>
      </div>

      {/* Score Cards Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6 h-[600px]">
        {fitScoreData.map((commodity) => (
          <Dialog key={commodity.id}>
            <DialogTrigger asChild>
              <Card 
                className="h-[280px] cursor-pointer hover:shadow-xl hover:border-primary/50 hover:scale-[1.02] transition-all duration-200 bg-card border-border rounded-xl shadow-lg p-5"
                onClick={() => setSelectedCommodity(commodity)}
              >
                <CardHeader className="pb-2 p-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {commodity.name}
                    </CardTitle>
                    <div className="flex items-center">
                      {commodity.recentTrend === 'up' && <TrendingUp className="w-5 h-5 text-sentiment-positive" />}
                      {commodity.recentTrend === 'down' && <TrendingDown className="w-5 h-5 text-sentiment-negative" />}
                      {commodity.recentTrend === 'stable' && <BarChart3 className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="flex-1">
                    {/* Fit Score */}
                    <div className="text-center mb-4">
                      <div className={`text-3xl font-bold ${getScoreColor(commodity.fitScore)} mb-2`}>
                        {commodity.fitScore}점
                      </div>
                      <Badge className={getScoreBgColor(commodity.fitScore)}>
                        {commodity.evaluation}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <Progress value={commodity.fitScore} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0점</span>
                        <span>100점</span>
                      </div>
                    </div>

                    {/* Match Statistics */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">2주간 일치율</span>
                        <span className="font-semibold text-sm text-foreground">
                          {commodity.matchDays}/{commodity.totalDays}일
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">상관계수</span>
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold text-sm text-foreground">{commodity.correlation}</span>
                          <Badge variant="secondary" className={`${getEvaluationColor(commodity.evaluation)} text-xs`}>
                            {commodity.evaluation}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Click indicator */}
                  <div className="text-center mt-3 pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">클릭하여 상세보기</span>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-[80vw] max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-xl">{commodity.name} 적합도 상세 분석</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 overflow-auto max-h-[60vh]">
                {/* Score Trend */}
                <div>
                  <h4 className="font-semibold mb-2 text-base">주간 점수 변화</h4>
                  <div className="flex items-end space-x-3 h-24">
                    {commodity.details.weeklyScores.map((score, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="bg-primary rounded-t w-full"
                          style={{ height: `${(score / 100) * 80}%` }}
                        />
                        <span className="text-xs mt-1">Week {index + 1}</span>
                        <span className="text-xs text-muted-foreground">{score}점</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Matching Analysis */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="font-semibold mb-2 text-green-700 text-sm">일치 날짜</h4>
                    <div className="bg-green-50 p-2 rounded-lg max-h-[120px] overflow-y-auto">
                      <div className="flex flex-wrap gap-1">
                        {commodity.details.matchingDates.map((date, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            {date}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-red-700 text-sm">불일치 날짜</h4>
                    <div className="bg-red-50 p-2 rounded-lg max-h-[120px] overflow-y-auto">
                      <div className="flex flex-wrap gap-1">
                        {commodity.details.nonMatchingDates.map((date, index) => (
                          <Badge key={index} variant="secondary" className="bg-red-100 text-red-800 text-xs">
                            {date}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm">분석 설명</h4>
                  <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg max-h-[120px] overflow-y-auto">
                    {commodity.details.explanation}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="bg-white rounded-lg shadow p-4 h-[140px]">
        <CardHeader className="pb-2 p-0">
          <CardTitle className="text-lg font-semibold">전체 분석 요약</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(fitScoreData.reduce((acc, item) => acc + item.fitScore, 0) / fitScoreData.length)}점
              </div>
              <p className="text-gray-600 text-sm mt-1">전체 평균 적합도</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {fitScoreData.filter(item => item.fitScore >= 80).length}개
              </div>
              <p className="text-gray-600 text-sm mt-1">고적합도 품목 (80점+)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                0.{Math.round(fitScoreData.reduce((acc, item) => acc + item.correlation, 0) / fitScoreData.length * 100)}
              </div>
              <p className="text-gray-600 text-sm mt-1">평균 상관계수</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(fitScoreData.reduce((acc, item) => acc + (item.matchDays / item.totalDays * 100), 0) / fitScoreData.length)}%
              </div>
              <p className="text-gray-600 text-sm mt-1">전체 일치율</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}