import { useQuery } from "@tanstack/react-query";
import { SaasCard, SaasCardHeader, SaasCardTitle, SaasCardContent } from "@/components/ui/saas-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ExternalLink } from "lucide-react";

interface NewsFeedItem {
  id: number;
  title: string;
  commodity: string;
  emoji: string;
  timeAgo: string;
  publishedAt: string;
}

interface LatestNewsFeedProps {
  onNewsSelect?: (newsId: number) => void;
}

export default function LatestNewsFeed({ onNewsSelect }: LatestNewsFeedProps) {
  const { data: newsFeed, isLoading } = useQuery<NewsFeedItem[]>({
    queryKey: ["/api/latest-news-feed"],
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <SaasCard>
        <SaasCardHeader>
          <SaasCardTitle>최신 뉴스 피드</SaasCardTitle>
        </SaasCardHeader>
        <SaasCardContent>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 border border-neutral/20 rounded-lg">
                <Skeleton className="w-6 h-6 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </SaasCardContent>
      </SaasCard>
    );
  }

  return (
    <SaasCard>
      <SaasCardHeader>
        <div className="flex items-center justify-between">
          <SaasCardTitle>최신 뉴스 피드</SaasCardTitle>
          <div className="flex items-center space-x-1 text-sm text-neutral">
            <Clock className="w-4 h-4" />
            <span>실시간 업데이트</span>
          </div>
        </div>
      </SaasCardHeader>
      <SaasCardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {newsFeed?.map((news) => (
            <div 
              key={news.id} 
              className="flex items-start space-x-3 p-3 border border-neutral/20 rounded-lg hover:bg-neutral-light transition-colors cursor-pointer"
              onClick={() => onNewsSelect?.(news.id)}
            >
              <div className="flex-shrink-0">
                <span className="text-lg">{news.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-medium text-neutral-dark line-clamp-2 mb-1">
                  {news.title}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary font-medium">
                    {news.commodity}
                  </span>
                  <span className="text-xs text-neutral">
                    {news.timeAgo}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral flex-shrink-0" />
            </div>
          ))}
          
          {(!newsFeed || newsFeed.length === 0) && (
            <div className="text-center py-8 text-neutral">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>뉴스 피드를 불러오는 중...</p>
            </div>
          )}
        </div>
      </SaasCardContent>
    </SaasCard>
  );
}