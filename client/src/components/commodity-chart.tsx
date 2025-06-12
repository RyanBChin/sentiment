import { useQuery } from "@tanstack/react-query";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import type { CommodityHistory } from "@shared/schema";

interface CommodityChartProps {
  commodityId: number;
  commodityName: string;
}

export default function CommodityChart({ commodityId, commodityName }: CommodityChartProps) {
  const { data: history, isLoading } = useQuery<CommodityHistory[]>({
    queryKey: ["/api/commodities", commodityId, "history"]
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!history || history.length === 0) {
    return (
      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-sm">차트 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // Format data for the chart
  const chartData = history.map(item => ({
    date: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    sentimentScore: item.sentimentScore,
    price: item.price,
    fullDate: item.date
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'sentimentScore' ? '센티먼트 점수' : '가격'}: {entry.value}
              {entry.dataKey === 'price' && ' $'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }}
            stroke="#666"
          />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 10 }}
            stroke="#8884d8"
            label={{ value: '센티먼트 점수', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '10px' } }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            tick={{ fontSize: 10 }}
            stroke="#82ca9d"
            label={{ value: '가격 ($)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: '10px' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '10px' }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sentimentScore"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="센티먼트 점수"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="price"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="가격 ($)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}