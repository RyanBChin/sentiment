import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, AlertTriangle, TrendingDown, Volume2 } from "lucide-react";
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

  const getCommodityIcon = (name: string) => {
    const iconConfig = {
      '옥수수': { bg: 'bg-yellow-100', icon: '🌽', color: 'text-yellow-600' },
      '밀': { bg: 'bg-amber-100', icon: '🌾', color: 'text-amber-600' },
      '구리': { bg: 'bg-orange-100', icon: '📊', color: 'text-orange-600' },
      'WTI유': { bg: 'bg-gray-800', icon: '🛢', color: 'text-white' },
      '금': { bg: 'bg-yellow-100', icon: '💰', color: 'text-yellow-600' },
    };

    const config = iconConfig[name as keyof typeof iconConfig] || { bg: 'bg-gray-100', icon: '📦', color: 'text-gray-600' };
    
    return (
      <div className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center`}>
        <span className="text-2xl">{config.icon}</span>
      </div>
    );
  };

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
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">평균 점수</p>
                <p className="text-2xl font-bold text-blue-900">70.6</p>
                <p className="text-xs text-green-600">📈 +2.3% 지난달 대비</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">최고 점수 상품</p>
                <p className="text-lg font-bold text-green-900">WTI Crude Oil</p>
                <p className="text-xs text-green-600">95점</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">🏆</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600 font-medium">상승 상품</p>
                <p className="text-2xl font-bold text-teal-900">3</p>
                <p className="text-xs text-teal-600">전체 5개 상품 중</p>
              </div>
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-teal-600">📈</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">변동성</p>
                <p className="text-2xl font-bold text-orange-900">중간</p>
                <div className="w-16 h-2 bg-orange-200 rounded-full mt-1">
                  <div className="w-10 h-2 bg-orange-500 rounded-full"></div>
                </div>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commodity Sentiment Scores */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">실시간 시황 점수</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg">점수순</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">변동률순</button>
          </div>
        </div>
        
        <div className="space-y-3">
          {commodities.map((commodity) => (
            <Card
              key={commodity.id}
              className="bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={() => onCommoditySelect(commodity)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {/* Left: Icon and Name */}
                  <div className="flex items-center space-x-4">
                    {getCommodityIcon(commodity.name)}
                    <div>
                      <h3 className="font-bold text-gray-900">{commodity.name}</h3>
                      <p className="text-sm text-gray-600">{commodity.englishName}</p>
                    </div>
                  </div>
                  
                  {/* Center: Score */}
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${getSentimentBgColor(commodity.sentimentScore)}`}>
                      {commodity.sentimentScore}점
                    </div>
                  </div>
                  
                  {/* Right: Price and Change */}
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      현재 가격: {commodity.price.toLocaleString()}$/배럴
                    </p>
                    <div className="flex items-center justify-end space-x-2">
                      <p className="text-sm text-gray-600">변동률</p>
                      <span className={`font-semibold text-sm ${getChangeColor(commodity.priceChange)}`}>
                        {commodity.priceChange >= 0 ? '+' : ''}{commodity.priceChange}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-2">
                      <div 
                        className={`h-2 rounded-full ${commodity.priceChange >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(Math.abs(commodity.priceChange) * 10, 100)}%` }}
                      ></div>
                    </div>
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
