import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SaasCard, SaasCardHeader, SaasCardTitle, SaasCardContent } from "@/components/ui/saas-card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Mover {
  commodity: string;
  change: number;
  emoji: string;
}

interface TopMoversData {
  gainers: Mover[];
  losers: Mover[];
}

const timeframes = [
  { value: '1d', label: '1 Day' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '1y', label: '1 Year' }
];

export default function TopMovers() {
  const [selectedPeriod, setSelectedPeriod] = useState('1d');

  const { data, isLoading } = useQuery<TopMoversData>({
    queryKey: ["/api/top-movers", selectedPeriod],
    queryFn: () => fetch(`/api/top-movers?period=${selectedPeriod}`).then(res => res.json()),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <SaasCard>
        <SaasCardHeader>
          <div className="flex items-center justify-between">
            <SaasCardTitle>주요 변동 종목</SaasCardTitle>
            <Skeleton className="h-8 w-24" />
          </div>
        </SaasCardHeader>
        <SaasCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-lg font-semibold text-green-600">상승 종목</span>
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <span className="text-lg font-semibold text-red-600">하락 종목</span>
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>
        </SaasCardContent>
      </SaasCard>
    );
  }

  return (
    <SaasCard>
      <SaasCardHeader>
        <div className="flex items-center justify-between">
          <SaasCardTitle>주요 변동 종목</SaasCardTitle>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-lg px-3 py-1 border border-neutral text-neutral-dark bg-card-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          >
            {timeframes.map((timeframe) => (
              <option key={timeframe.value} value={timeframe.value}>
                {timeframe.label}
              </option>
            ))}
          </select>
        </div>
      </SaasCardHeader>
      <SaasCardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-lg font-semibold text-green-600">상승 종목</span>
            </div>
            {data?.gainers?.map((gainer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg transition-all hover:bg-green-100">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{gainer.emoji}</span>
                  <span className="text-base font-semibold text-neutral-dark">{gainer.commodity}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-bold text-green-500">
                    +{gainer.change.toFixed(1)}%
                  </span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
              </div>
            ))}
            {(!data?.gainers || data.gainers.length === 0) && (
              <div className="text-center py-8 text-neutral">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-neutral" />
                <p>상승 종목이 없습니다</p>
              </div>
            )}
          </div>

          {/* Top Losers */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span className="text-lg font-semibold text-red-600">하락 종목</span>
            </div>
            {data?.losers?.map((loser, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg transition-all hover:bg-red-100">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{loser.emoji}</span>
                  <span className="text-base font-semibold text-neutral-dark">{loser.commodity}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-bold text-red-500">
                    {loser.change.toFixed(1)}%
                  </span>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
              </div>
            ))}
            {(!data?.losers || data.losers.length === 0) && (
              <div className="text-center py-8 text-neutral">
                <TrendingDown className="w-8 h-8 mx-auto mb-2 text-neutral" />
                <p>하락 종목이 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </SaasCardContent>
    </SaasCard>
  );
}