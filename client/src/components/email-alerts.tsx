import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Bell, Mail, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const alertFormSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  commodities: z.array(z.string()).min(1, "최소 하나의 상품을 선택해주세요"),
  frequency: z.enum(["hourly", "daily", "weekly"]),
});

type AlertFormData = z.infer<typeof alertFormSchema>;

export default function EmailAlerts() {
  const [selectedCommodities, setSelectedCommodities] = useState<string[]>([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      frequency: "daily",
      commodities: []
    }
  });

  const alertMutation = useMutation({
    mutationFn: async (data: AlertFormData) => {
      const response = await apiRequest('POST', '/api/email-alerts', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "알림 설정 완료",
        description: "이메일 알림이 성공적으로 설정되었습니다.",
      });
      reset();
      setSelectedCommodities([]);
    },
    onError: () => {
      toast({
        title: "설정 실패",
        description: "알림 설정 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  });

  const commodityOptions = [
    { value: "corn", label: "옥수수 (Corn)" },
    { value: "wheat", label: "밀 (Wheat)" },
    { value: "copper", label: "구리 (Copper)" },
    { value: "wti", label: "WTI 원유" },
    { value: "gold", label: "금 (Gold)" }
  ];

  const frequencyOptions = [
    { value: "hourly", label: "시간별 (Hourly)" },
    { value: "daily", label: "일별 (Daily)" },
    { value: "weekly", label: "주별 (Weekly)" }
  ];

  const handleCommodityChange = (commodity: string, checked: boolean) => {
    let newSelection: string[];
    if (checked) {
      newSelection = [...selectedCommodities, commodity];
    } else {
      newSelection = selectedCommodities.filter(c => c !== commodity);
    }
    setSelectedCommodities(newSelection);
    setValue("commodities", newSelection);
  };

  const onSubmit = (data: AlertFormData) => {
    alertMutation.mutate(data);
  };

  const watchedFrequency = watch("frequency");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">알림 설정</h2>
        <p className="text-gray-600">관심 있는 상품의 시장 동향을 이메일로 받아보세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              알림 설정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Commodity Selection */}
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                  관심 상품 선택
                </Label>
                <div className="space-y-3">
                  {commodityOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={selectedCommodities.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleCommodityChange(option.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={option.value} className="text-gray-700">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.commodities && (
                  <p className="text-sm text-red-600 mt-1">{errors.commodities.message}</p>
                )}
              </div>

              {/* Alert Frequency */}
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                  알림 주기
                </Label>
                <RadioGroup
                  value={watchedFrequency}
                  onValueChange={(value) => setValue("frequency", value as "hourly" | "daily" | "weekly")}
                >
                  {frequencyOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="text-gray-700">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Email Address */}
              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-900 mb-2 block">
                  이메일 주소
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={alertMutation.isPending}
              >
                <Bell className="w-4 h-4 mr-2" />
                {alertMutation.isPending ? "설정 중..." : "알림 설정 저장"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sample Alert Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              📬 알림 미리보기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="font-semibold text-gray-900 mb-2">Market Sentiment Alert</div>
                <div className="space-y-2 text-gray-700">
                  <p><strong>품목:</strong> 옥수수</p>
                  <p><strong>점수:</strong> <span className="text-sentiment-positive font-medium">78.5</span></p>
                  <p><strong>키워드:</strong> drought, supply cut</p>
                  <p><strong>요약:</strong> "Corn prices surged due to continued drought conditions in the Midwest, leading to supply concerns. Chinese import demand remains strong, contributing to positive sentiment..."</p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  <p>2024년 1월 15일 09:00 KST</p>
                </div>
              </div>
            </div>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">알림 정보</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• 선택한 상품의 센티먼트 점수 변화</li>
                      <li>• 주요 뉴스 키워드 및 요약</li>
                      <li>• 가격 변동 정보</li>
                      <li>• 설정한 주기에 따라 자동 전송</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
