import { useQuery } from "@tanstack/react-query";
import { SaasCard, SaasCardHeader, SaasCardTitle, SaasCardContent } from "@/components/ui/saas-card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface GainerLoser {
  commodity: string;
  change: number;
  emoji: string;
}

interface TopGainersLosersData {
  gainers: GainerLoser[];
  losers: GainerLoser[];
}

export default function TopGainersLosers() {
  const { data, isLoading } = useQuery<TopGainersLosersData>({
    queryKey: ["/api/top-gainers-losers"]
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SaasCard>
          <SaasCardHeader>
            <SaasCardTitle className="text-green-600">상승 종목</SaasCardTitle>
          </SaasCardHeader>
          <SaasCardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </SaasCardContent>
        </SaasCard>

        <SaasCard>
          <SaasCardHeader>
            <SaasCardTitle className="text-red-600">하락 종목</SaasCardTitle>
          </SaasCardHeader>
          <SaasCardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </SaasCardContent>
        </SaasCard>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Top Gainers */}
      <SaasCard>
        <SaasCardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <SaasCardTitle className="text-green-600">상승 종목</SaasCardTitle>
          </div>
        </SaasCardHeader>
        <SaasCardContent>
          <div className="space-y-3">
            {data?.gainers?.map((gainer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{gainer.emoji}</span>
                  <span className="text-base font-semibold text-neutral-dark">{gainer.commodity}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-semibold text-green-500">
                    +{gainer.change.toFixed(1)}%
                  </span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
              </div>
            ))}
            {(!data?.gainers || data.gainers.length === 0) && (
              <div className="text-center py-4 text-neutral">
                상승 종목이 없습니다
              </div>
            )}
          </div>
        </SaasCardContent>
      </SaasCard>

      {/* Top Losers */}
      <SaasCard>
        <SaasCardHeader>
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <SaasCardTitle className="text-red-600">하락 종목</SaasCardTitle>
          </div>
        </SaasCardHeader>
        <SaasCardContent>
          <div className="space-y-3">
            {data?.losers?.map((loser, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{loser.emoji}</span>
                  <span className="text-base font-semibold text-neutral-dark">{loser.commodity}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-semibold text-red-500">
                    {loser.change.toFixed(1)}%
                  </span>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
              </div>
            ))}
            {(!data?.losers || data.losers.length === 0) && (
              <div className="text-center py-4 text-neutral">
                하락 종목이 없습니다
              </div>
            )}
          </div>
        </SaasCardContent>
      </SaasCard>
    </div>
  );
}