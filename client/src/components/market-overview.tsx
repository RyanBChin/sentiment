import { useQuery } from "@tanstack/react-query";
import { SaasCard, SaasCardHeader, SaasCardTitle, SaasCardContent } from "@/components/ui/saas-card";
import { SaasButton } from "@/components/ui/saas-button";
import { SaasPageHeader, SaasGrid } from "@/components/ui/saas-layout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, AlertTriangle, TrendingDown, AlertCircle } from "lucide-react";
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
      <div className="space-y-8">
        <SaasCard>
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2" />
        </SaasCard>
        <SaasGrid cols={5}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SaasCard key={i}>
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-16 w-full mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </SaasCard>
          ))}
        </SaasGrid>
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
    <div className="space-y-8">
      {/* Sentiment Alert */}
      {sentimentAlert && (
        <SaasCard variant="gradient">
          <div className="flex items-center justify-between">
            <div>
              <SaasCardTitle className="text-white mb-2">센티먼트 알림</SaasCardTitle>
              <p className="text-blue-100 text-lg">
                {sentimentAlert.commodity}: 점수 {sentimentAlert.currentScore} 
                <span className={`ml-2 font-semibold ${sentimentAlert.scoreChange >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                  ({sentimentAlert.scoreChange >= 0 ? '+' : ''}{sentimentAlert.scoreChange})
                </span>
              </p>
            </div>
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
        </SaasCard>
      )}

      {/* Page Header */}
      <SaasPageHeader 
        title="시장 현황"
        action={
          <SaasButton variant="secondary" size="sm">
            실시간 업데이트
          </SaasButton>
        }
      />

      {/* Commodity Cards */}
      <SaasGrid cols={5}>
        {commodities.map((commodity) => (
          <SaasCard 
            key={commodity.id} 
            clickable={true}
            hoverable={true}
            onClick={() => onCommoditySelect(commodity)}
          >
            <SaasCardHeader>
              <div className="flex items-center justify-between">
                <SaasCardTitle className="text-lg">{commodity.name}</SaasCardTitle>
                <div className={`w-4 h-4 rounded-full ${
                  commodity.sentimentScore >= 70 ? 'bg-sentiment-positive' : 
                  commodity.sentimentScore >= 50 ? 'bg-warning' : 'bg-sentiment-negative'
                }`}></div>
              </div>
            </SaasCardHeader>
            
            <SaasCardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral font-medium">센티먼트 점수</span>
                <span className="text-2xl font-bold text-neutral-dark">{commodity.sentimentScore.toFixed(1)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral font-medium">현재가격</span>
                <span className="text-lg font-bold text-neutral-dark">
                  {commodity.price.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral font-medium">변동률</span>
                <div className="flex items-center">
                  <span className={`text-lg font-bold text-neutral-dark`}>
                    {commodity.priceChange >= 0 ? '+' : ''}{commodity.priceChange.toFixed(2)}%
                  </span>
                  {commodity.priceChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 ml-1 text-sentiment-positive" />
                  ) : (
                    <TrendingDown className="w-4 h-4 ml-1 text-sentiment-negative" />
                  )}
                </div>
              </div>
              
              <div className="pt-3 border-t border-neutral">
                <div className="flex flex-wrap gap-2">
                  {commodity.keywords.slice(0, 2).map((keyword, index) => (
                    <span key={index} className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </SaasCardContent>
          </SaasCard>
        ))}
      </SaasGrid>
    </div>
  );
}
