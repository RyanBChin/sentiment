import { useQuery } from "@tanstack/react-query";
import { SaasCard, SaasCardHeader, SaasCardTitle, SaasCardContent } from "@/components/ui/saas-card";
import { SaasGrid } from "@/components/ui/saas-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TrendData {
  commodity: string;
  emoji: string;
  sparklineData: { value: number }[];
  totalChange: number;
}

export default function TrendSnapshot() {
  const { data: commodities, isLoading } = useQuery<any[]>({
    queryKey: ["/api/commodities"]
  });

  // Generate mock sparkline data for demonstration
  const generateSparklineData = (basePrice: number, volatility: number = 0.02) => {
    const data = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < 7; i++) {
      const change = (Math.random() - 0.5) * volatility * currentPrice;
      currentPrice += change;
      data.push({ value: currentPrice });
    }
    
    return data;
  };

  const getCommodityEmoji = (name: string) => {
    const emojiMap: { [key: string]: string } = {
      '옥수수': '🌽',
      '밀': '🌾',
      '구리': '🥉',
      'WTI 오일': '🛢️',
      '금': '🥇'
    };
    return emojiMap[name] || '📈';
  };

  if (isLoading) {
    return (
      <SaasCard>
        <SaasCardHeader>
          <SaasCardTitle>7일 트렌드 스냅샷</SaasCardTitle>
        </SaasCardHeader>
        <SaasCardContent>
          <SaasGrid cols={5}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </SaasGrid>
        </SaasCardContent>
      </SaasCard>
    );
  }

  const trendData: TrendData[] = commodities?.map(commodity => {
    const sparklineData = generateSparklineData(commodity.price);
    const totalChange = ((sparklineData[6].value - sparklineData[0].value) / sparklineData[0].value) * 100;
    
    return {
      commodity: commodity.name,
      emoji: getCommodityEmoji(commodity.name),
      sparklineData,
      totalChange
    };
  }) || [];

  return (
    <SaasCard>
      <SaasCardHeader>
        <SaasCardTitle>7일 트렌드 스냅샷</SaasCardTitle>
      </SaasCardHeader>
      <SaasCardContent>
        <SaasGrid cols={5}>
          {trendData.map((trend, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{trend.emoji}</span>
                <span className="text-sm font-semibold text-neutral-dark">{trend.commodity}</span>
              </div>
              
              <div className="h-10 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend.sparklineData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={trend.totalChange >= 0 ? "#22C55E" : "#EF4444"}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className={`text-lg font-bold ${
                  trend.totalChange >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {trend.totalChange >= 0 ? '+' : ''}{trend.totalChange.toFixed(1)}%
                </span>
                {trend.totalChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </SaasGrid>
      </SaasCardContent>
    </SaasCard>
  );
}