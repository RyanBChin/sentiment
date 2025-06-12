import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, BarChart3 } from "lucide-react";
import CommodityChart from "@/components/commodity-chart";
import type { Commodity, News } from "@shared/schema";

interface CommodityDetailProps {
  commodity: Commodity | null;
  onBack: () => void;
  onNewsSelect: (news: News) => void;
}

export default function CommodityDetail({ commodity, onBack, onNewsSelect }: CommodityDetailProps) {
  // Generate dummy news data based on commodity
  const getDummyNews = (commodityId: number, commodityName: string): News[] => {
    const newsData: Record<number, News[]> = {
      1: [ // 옥수수
        {
          id: 101,
          commodityId: 1,
          title: "미국 중서부 가뭄으로 옥수수 생산량 20% 감소 전망",
          snippet: "올해 이상 기후로 인한 가뭄이 지속되면서 미국 주요 옥수수 생산지역의 수확량이 크게 줄어들 것으로 예상된다고 농무부가 발표했습니다.",
          content: "올해 미국 중서부 지역에 발생한 극심한 가뭄으로 인해 옥수수 생산량이 예년 대비 20% 감소할 것으로 전망된다고 미국 농무부가 발표했습니다.\n\n특히 아이오와, 일리노이, 네브래스카 등 주요 옥수수 생산 주에서 강수량이 평년의 60% 수준에 머물러 작물 생육에 심각한 영향을 미치고 있습니다. 농무부 관계자는 \"현재의 기상 패턴이 지속될 경우 옥수수 수확량은 예상보다 더 큰 폭으로 감소할 수 있다\"며 \"이는 국제 곡물 시장에 상당한 영향을 미칠 것\"이라고 경고했습니다.\n\n이러한 공급 부족 우려로 시카고 상품거래소(CBOT)에서 옥수수 선물 가격은 지난 주 대비 8% 상승했으며, 전문가들은 향후 몇 개월간 가격 상승세가 지속될 것으로 전망하고 있습니다.\n\n한국도 주요 옥수수 수입국으로서 이번 생산량 감소가 사료 가격과 축산업에 미칠 파급효과에 대한 대비책 마련이 시급한 상황입니다.",
          sentimentScore: 35,
          keywords: ["가뭄", "생산량감소", "가격상승"],
          publishedAt: new Date('2024-12-12T10:00:00Z')
        },
        {
          id: 102,
          commodityId: 1,
          title: "중국 옥수수 수입량 급증, 글로벌 공급 부족 심화",
          snippet: "중국이 사료용 옥수수 수입을 대폭 늘리면서 국제 옥수수 시장의 공급 부족 현상이 더욱 심화되고 있습니다.",
          content: "중국이 올해 들어 옥수수 수입량을 전년 대비 40% 늘리면서 글로벌 옥수수 시장의 공급 부족 현상이 심화되고 있습니다.\n\n중국 해관총서에 따르면 올해 1-11월 옥수수 수입량은 2,850만 톤으로 작년 같은 기간 대비 38% 증가했습니다. 이는 중국 내 돼지고기 생산량 증가에 따른 사료 수요 급증과 국내 옥수수 가격 상승이 주요 원인으로 분석됩니다.\n\n특히 중국은 미국, 우크라이나, 브라질 등에서 대량의 옥수수를 수입하고 있어 국제 시장의 공급 균형에 큰 영향을 미치고 있습니다. 업계 전문가는 \"중국의 수입 증가가 계속될 경우 내년까지 글로벌 옥수수 가격 상승 압력이 지속될 것\"이라고 전망했습니다.",
          sentimentScore: 40,
          keywords: ["중국수입", "공급부족", "사료용"],
          publishedAt: new Date('2024-12-12T08:30:00Z')
        },
        {
          id: 103,
          commodityId: 1,
          title: "바이오연료 수요 증가로 옥수수 가격 상승세",
          snippet: "친환경 정책 강화로 바이오에탄올 생산이 늘어나면서 원료인 옥수수에 대한 수요가 급증하고 있습니다.",
          content: "전 세계적인 친환경 정책 강화로 바이오에탄올 생산량이 늘어나면서 원료인 옥수수에 대한 수요가 급증하고 있습니다.\n\n미국 에너지정보청(EIA)에 따르면 올해 바이오에탄올 생산에 사용된 옥수수는 약 5억 부셸로 전년 대비 12% 증가했습니다. 이는 미국 전체 옥수수 생산량의 약 35%에 해당하는 규모입니다.\n\n특히 유럽연합의 재생에너지 의무 비율 확대와 미국의 재생연료기준(RFS) 정책으로 바이오연료 수요가 지속적으로 증가하고 있어 옥수수 가격 상승 요인으로 작용하고 있습니다.\n\n업계에서는 탄소중립 정책이 강화될수록 바이오연료용 옥수수 수요는 더욱 늘어날 것으로 예상한다고 밝혔습니다.",
          sentimentScore: 65,
          keywords: ["바이오연료", "에탄올", "친환경"],
          publishedAt: new Date('2024-12-12T06:45:00Z')
        }
      ],
      2: [ // 밀
        {
          id: 201,
          commodityId: 2,
          title: "우크라이나 밀 수출 재개, 국제가격 하락 압력",
          snippet: "흑해 곡물 협정 연장으로 우크라이나산 밀 수출이 정상화되면서 국제 밀 가격에 하락 압력이 가해지고 있습니다.",
          content: "흑해 곡물 협정이 재연장되면서 우크라이나산 밀 수출이 정상화 궤도에 오르고 있어 국제 밀 가격에 하락 압력이 가해지고 있습니다.\n\n우크라이나 농업정책식품부에 따르면 지난달 밀 수출량은 250만 톤으로 전쟁 이전 수준의 80%까지 회복되었습니다. 특히 오데사, 체르노모르스크 등 주요 항구의 운영이 재개되면서 수출 물류가 크게 개선되었습니다.\n\n이러한 공급량 증가로 시카고 밀 선물 가격은 지난 주 대비 5% 하락했으며, 유럽 밀 가격도 동반 하락하고 있습니다. 업계에서는 우크라이나 밀 수출이 지속적으로 증가할 경우 내년 상반기까지 국제 밀 가격의 약세가 이어질 것으로 전망하고 있습니다.",
          sentimentScore: 45,
          keywords: ["우크라이나", "수출재개", "가격하락"],
          publishedAt: new Date('2024-12-12T09:15:00Z')
        },
        {
          id: 202,
          commodityId: 2,
          title: "인도 밀 수출 금지 연장, 글로벌 공급 우려",
          snippet: "인도 정부가 식량 안보를 이유로 밀 수출 금지 조치를 연장하기로 결정하면서 글로벌 밀 공급에 대한 우려가 커지고 있습니다.",
          content: "인도 정부가 국내 식량 안보를 위해 밀 수출 금지 조치를 내년 3월까지 연장하기로 결정하면서 글로벌 밀 공급에 대한 우려가 커지고 있습니다.\n\n인도는 세계 2위의 밀 생산국으로 연간 약 1,100만 톤의 밀을 수출해왔습니다. 하지만 올해 극심한 폭염으로 밀 생산량이 예년 대비 8% 감소하면서 정부가 수출 제한 조치를 취했습니다.\n\n이번 수출 금지 연장으로 중동과 아프리카 지역의 밀 수입국들은 대체 공급처 확보에 어려움을 겪고 있습니다. 특히 방글라데시와 스리랑카 등 주요 수입국들은 가격 상승과 공급 부족으로 식량 위기 우려가 높아지고 있는 상황입니다.",
          sentimentScore: 30,
          keywords: ["인도", "수출금지", "식량안보"],
          publishedAt: new Date('2024-12-12T07:20:00Z')
        }
      ],
      3: [ // 구리
        {
          id: 301,
          commodityId: 3,
          title: "전기차 급성장으로 구리 수요 폭증, 가격 강세 지속",
          snippet: "전 세계 전기차 판매량이 급증하면서 배터리와 모터에 필수적인 구리에 대한 수요가 크게 늘어나고 있습니다.",
          content: "전 세계 전기차 시장의 급성장으로 구리 수요가 폭증하면서 가격 강세가 지속되고 있습니다.\n\n국제에너지기구(IEA)에 따르면 올해 전기차 판매량은 전년 대비 35% 증가한 1,400만 대를 기록할 것으로 예상됩니다. 전기차 한 대당 평균 83kg의 구리가 사용되어 내연기관차 대비 4배 많은 구리가 필요합니다.\n\n특히 중국, 유럽, 미국의 전기차 보급 정책 확대와 배터리 기술 발전으로 구리 수요는 지속적으로 증가할 전망입니다. 런던금속거래소(LME)에서 구리 가격은 올해 들어 22% 상승했으며, 업계에서는 2030년까지 구리 수요가 현재의 2배 수준까지 늘어날 것으로 예측하고 있습니다.",
          sentimentScore: 78,
          keywords: ["전기차", "배터리", "수요증가"],
          publishedAt: new Date('2024-12-12T11:30:00Z')
        },
        {
          id: 302,
          commodityId: 3,
          title: "칠레 구리 광산 파업으로 공급 차질 우려",
          snippet: "세계 최대 구리 생산국인 칠레의 주요 광산에서 임금 협상 결렬로 파업이 시작되어 구리 공급에 차질이 예상됩니다.",
          content: "세계 최대 구리 생산국인 칠레의 주요 광산에서 대규모 파업이 시작되어 글로벌 구리 공급에 차질이 우려되고 있습니다.\n\n칠레 최대 구리 광산인 에스콘디다(Escondida) 광산 노동자들이 임금 인상 요구가 받아들여지지 않자 무기한 파업에 돌입했습니다. 이 광산은 세계 구리 생산량의 약 5%를 담당하는 핵심 시설입니다.\n\n칠레는 전 세계 구리 생산량의 28%를 차지하는 최대 생산국으로, 이번 파업이 장기화될 경우 글로벌 구리 공급망에 심각한 타격을 줄 것으로 예상됩니다. 이미 LME 구리 가격은 파업 소식 이후 8% 급등했으며, 업계에서는 공급 부족 우려가 더욱 커지고 있습니다.",
          sentimentScore: 25,
          keywords: ["칠레", "광산파업", "공급차질"],
          publishedAt: new Date('2024-12-12T09:45:00Z')
        },
        {
          id: 303,
          commodityId: 3,
          title: "중국 인프라 투자 확대, 구리 수요 급증 전망",
          snippet: "중국 정부의 대규모 인프라 투자 계획 발표로 건설용 구리 수요가 크게 늘어날 것으로 예상됩니다.",
          content: "중국 정부가 발표한 대규모 인프라 투자 계획으로 건설용 구리 수요가 급증할 것으로 전망됩니다.\n\n중국 국가발전개혁위원회는 향후 5년간 총 50조 위안(약 7조 달러) 규모의 인프라 투자를 단행한다고 발표했습니다. 이 중 전력망 현대화, 5G 네트워크 구축, 신에너지 인프라 등이 주요 투자 분야로 선정되었습니다.\n\n특히 전력 인프라 투자만 15조 위안 규모로 계획되어 있어 송전선과 변전소 건설에 필요한 구리 수요가 크게 늘어날 것으로 예상됩니다. 업계 전문가들은 이번 인프라 투자로 중국의 연간 구리 소비량이 현재 1,200만 톤에서 1,500만 톤까지 증가할 것으로 전망하고 있습니다.",
          sentimentScore: 72,
          keywords: ["중국", "인프라", "건설수요"],
          publishedAt: new Date('2024-12-12T08:10:00Z')
        }
      ],
      4: [ // WTI 원유
        {
          id: 401,
          commodityId: 4,
          title: "OPEC+ 감산 연장으로 원유 가격 상승세",
          snippet: "OPEC+가 내년까지 원유 감산을 연장하기로 결정하면서 WTI 원유 가격이 강세를 보이고 있습니다.",
          content: "OPEC+가 2024년까지 원유 감산을 연장하기로 결정하면서 WTI 원유 가격이 강세를 보이고 있습니다.\n\nOPEC+ 회원국들은 화상 회의를 통해 현재 일일 200만 배럴 규모의 감산을 내년 말까지 연장하기로 합의했습니다. 이는 시장 예상보다 3개월 더 긴 기간으로, 원유 공급 제한을 통한 가격 안정화 의지를 보여준 것으로 해석됩니다.\n\n이번 결정으로 뉴욕상업거래소(NYMEX)에서 WTI 원유 선물 가격은 배럴당 78달러까지 상승했으며, 브렌트유도 83달러선을 돌파했습니다. 업계에서는 감산 연장으로 글로벌 원유 재고가 더욱 감소하여 내년 상반기까지 유가 상승세가 지속될 것으로 전망하고 있습니다.",
          sentimentScore: 70,
          keywords: ["OPEC+", "감산연장", "가격상승"],
          publishedAt: new Date('2024-12-12T10:15:00Z')
        },
        {
          id: 402,
          commodityId: 4,
          title: "미국 원유 재고 급감, 공급 부족 우려 확산",
          snippet: "미국 에너지정보청 발표에 따르면 원유 재고가 예상보다 크게 감소하여 공급 부족에 대한 우려가 커지고 있습니다.",
          content: "미국 에너지정보청(EIA) 발표에 따르면 지난주 미국 원유 재고가 예상보다 크게 감소하여 공급 부족에 대한 우려가 확산되고 있습니다.\n\nEIA 주간 재고 보고서에 따르면 원유 재고는 전주 대비 1,250만 배럴 감소한 4억 2,100만 배럴을 기록했습니다. 이는 시장 예상치인 300만 배럴 감소를 크게 웃도는 수준으로, 정제소 가동률 증가와 수출 확대가 주요 원인으로 분석됩니다.\n\n특히 쿠싱 지역의 원유 재고는 2,180만 배럴로 2021년 이후 최저 수준까지 떨어졌습니다. 이러한 재고 급감으로 WTI 원유 가격은 장중 5% 이상 급등했으며, 업계에서는 공급 부족 우려가 더욱 커질 것으로 예상하고 있습니다.",
          sentimentScore: 65,
          keywords: ["미국재고", "공급부족", "EIA"],
          publishedAt: new Date('2024-12-12T07:50:00Z')
        }
      ],
      5: [ // 금
        {
          id: 501,
          commodityId: 5,
          title: "연준 금리 인하 기대감으로 금값 상승세",
          snippet: "미국 연방준비제도의 금리 인하 가능성이 높아지면서 안전자산인 금에 대한 투자 수요가 늘어나고 있습니다.",
          content: "미국 연방준비제도(Fed)의 금리 인하 기대감이 높아지면서 안전자산인 금에 대한 투자 수요가 급증하고 있습니다.\n\n최근 발표된 미국 소비자물가지수(CPI)가 예상보다 낮게 나오면서 연준의 통화정책 완화 가능성이 높아졌습니다. 시장에서는 내년 상반기 중 0.5%포인트의 금리 인하가 있을 것으로 예상하고 있습니다.\n\n금리 인하 기대감으로 달러화가 약세를 보이면서 금 가격은 온스당 2,080달러까지 상승했습니다. 이는 올해 최고치에 근접한 수준으로, 투자자들이 인플레이션 헤지와 포트폴리오 다변화를 위해 금 투자를 늘리고 있는 것으로 분석됩니다.",
          sentimentScore: 75,
          keywords: ["연준", "금리인하", "안전자산"],
          publishedAt: new Date('2024-12-12T11:00:00Z')
        },
        {
          id: 502,
          commodityId: 5,
          title: "중앙은행 금 매입 증가, 수요 상승 지속",
          snippet: "전 세계 중앙은행들이 외환보유액 다변화를 위해 금 매입을 늘리면서 금 수요가 지속적으로 증가하고 있습니다.",
          content: "전 세계 중앙은행들의 금 매입이 크게 증가하면서 금 수요 상승세가 지속되고 있습니다.\n\n세계금협회(WGC)에 따르면 올해 3분기까지 전 세계 중앙은행의 금 매입량은 800톤으로 전년 동기 대비 28% 증가했습니다. 특히 중국, 러시아, 터키 등이 외환보유액 다변화와 달러 의존도 완화를 위해 금 매입을 대폭 늘렸습니다.\n\n중국 인민은행은 올해 들어 매월 지속적으로 금을 매입하여 보유량을 2,200톤까지 늘렸으며, 러시아도 서방 제재 대응책으로 금 보유량을 확대하고 있습니다. 이러한 중앙은행 수요는 금 가격의 강력한 지지 요인으로 작용하고 있습니다.",
          sentimentScore: 68,
          keywords: ["중앙은행", "외환보유액", "수요증가"],
          publishedAt: new Date('2024-12-12T09:30:00Z')
        },
        {
          id: 503,
          commodityId: 5,
          title: "달러 약세로 금 투자 매력도 상승",
          snippet: "미 달러화 약세가 지속되면서 달러 대비 상대적으로 매력적인 금 투자에 대한 관심이 높아지고 있습니다.",
          content: "미 달러화의 약세가 지속되면서 달러 대비 상대적으로 매력적인 금 투자에 대한 관심이 높아지고 있습니다.\n\n달러인덱스(DXY)는 최근 102.5까지 하락하여 3개월 만에 최저치를 기록했습니다. 이는 연준의 금리 인하 기대감과 미국 경제 성장 둔화 우려가 복합적으로 작용한 결과입니다.\n\n달러 약세는 금 가격에 긍정적인 영향을 미치는데, 달러로 거래되는 금의 구매력이 상대적으로 높아지기 때문입니다. 또한 다른 통화권 투자자들에게는 환율 부담이 줄어들어 금 투자 매력도가 상승합니다.\n\n골드만삭스는 달러 약세 추세가 지속될 경우 내년 금 가격이 온스당 2,200달러까지 상승할 가능성이 있다고 전망했습니다.",
          sentimentScore: 72,
          keywords: ["달러약세", "투자매력", "상대가치"],
          publishedAt: new Date('2024-12-12T06:15:00Z')
        }
      ]
    };

    return newsData[commodityId] || [];
  };

  const news = commodity ? getDummyNews(commodity.id, commodity.name) : [];
  const isLoading = false;

  if (!commodity) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">상품을 선택해주세요.</p>
      </div>
    );
  }

  const getSentimentColor = (score: number) => {
    if (score >= 70) return "text-sentiment-positive";
    if (score >= 50) return "text-sentiment-neutral";
    return "text-sentiment-negative";
  };

  const getSentimentText = (score: number) => {
    if (score >= 70) return "매우 긍정적";
    if (score >= 50) return "중립적";
    return "부정적";
  };

  const getSentimentBgColor = (score: number) => {
    if (score >= 70) return "bg-green-100 text-green-800";
    if (score >= 50) return "bg-gray-100 text-gray-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="h-screen overflow-hidden p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            뒤로
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {commodity.name} 상세 분석
          </h1>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-2 gap-6 h-[calc(100vh-120px)]">
        
        {/* Left Column */}
        <div className="flex flex-col space-y-4">
          
          {/* Top Left - Combined Sentiment + Market Metrics */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">📊 센티먼트 & 시장 지표</CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="grid grid-cols-2 gap-6">
                
                {/* Sentiment Score */}
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: getSentimentColor(commodity.sentimentScore) }}>
                    {commodity.sentimentScore}
                  </div>
                  <Badge
                    className={`${getSentimentBgColor(commodity.sentimentScore)} text-white px-4 py-2 text-sm font-medium`}
                  >
                    {getSentimentText(commodity.sentimentScore)}
                  </Badge>
                </div>

                {/* Market Metrics */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">현재 가격</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${commodity.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">일일 변동률</span>
                    <span className={`text-lg font-bold ${commodity.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {commodity.priceChange >= 0 ? '▲' : '▼'} {Math.abs(commodity.priceChange).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">센티먼트 점수</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {commodity.sentimentScore}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Left - Chart */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">📈 가격 & 센티먼트 추이 (2주)</CardTitle>
            </CardHeader>
            <CardContent className="pt-1 h-[calc(100%-80px)]">
              <div className="h-full">
                <CommodityChart 
                  commodityId={commodity.id} 
                  commodityName={commodity.name}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col space-y-4">
          
          {/* Top Right - Key Summary */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">🧠 핵심 요약</CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">주요 현황 이유</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {commodity.name}의 현재 센티먼트 점수는 {commodity.sentimentScore}로, 
                    {commodity.sentimentScore >= 70 ? ' 매우 긍정적인' : 
                     commodity.sentimentScore >= 50 ? ' 중립적인' : ' 부정적인'} 상황입니다.
                    시장 동향과 글로벌 경제 지표가 주요 영향 요인으로 작용하고 있습니다.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">주요 키워드</h4>
                  <div className="flex flex-wrap gap-2">
                    {commodity.keywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 font-medium"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Right - Related News */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">📰 관련 뉴스</CardTitle>
            </CardHeader>
            <CardContent className="pt-1 h-[calc(100%-80px)]">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : news && news.length > 0 ? (
                <div className="h-full overflow-y-auto space-y-3">
                  {news.map((article) => (
                    <div
                      key={article.id}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                      onClick={() => onNewsSelect(article)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 pr-3">
                          {article.title}
                        </h4>
                        <Badge
                          className={`text-xs font-medium ${getSentimentBgColor(article.sentimentScore)} flex-shrink-0`}
                        >
                          {article.sentimentScore}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                        {article.snippet}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {article.keywords.slice(0, 3).map((keyword, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-center">관련 뉴스가 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
