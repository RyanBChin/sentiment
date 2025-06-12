import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, User, Mic, Volume2, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Commodity } from "@shared/schema";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: '안녕하세요! 시장 센티먼트 분석 챗봇입니다. 상품 가격 동향이나 시장 분석에 대해 궁금한 점을 물어보세요.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  
  // Fetch market data for today's summary
  const { data: commodities } = useQuery<Commodity[]>({
    queryKey: ["/api/commodities"]
  });

  const { data: sentimentAlert } = useQuery<any>({
    queryKey: ["/api/sentiment-alert"]
  });

  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest('POST', '/api/rag-chatbot', { question });
      return response.json();
    },
    onSuccess: (data) => {
      const botMessage: ChatMessage = {
        id: Date.now().toString() + '_bot',
        type: 'bot',
        content: data.answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    },
  });

  const handleSubmit = (question: string) => {
    if (!question.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    chatMutation.mutate(question);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(inputValue);
  };

  const handleSpeechInput = () => {
    console.log('Speech input activated');
  };

  const handleSpeechOutput = (text: string) => {
    console.log('Speech output:', text);
  };

  const formatMessageContent = (content: string) => {
    return content.replace(/(\d+\.?\d*%?)/g, '<strong>$1</strong>')
                  .replace(/(상승|증가|급등)/g, '<span class="text-green-600 font-semibold">$1 ↗</span>')
                  .replace(/(하락|감소|급락)/g, '<span class="text-red-600 font-semibold">$1 ↘</span>');
  };

  const suggestedQuestions = [
    "오늘 옥수수 시장 이슈는?",
    "금 가격 변동 배경은?", 
    "WTI 원유 급등 원인은?",
    "구리 투자 전망은?",
    "밀 시장 센티먼트는?"
  ];

  const recentConversations = [
    { question: "금 투자 전망은?", answer: "현재 인플레이션 우려로 긍정적 전망" },
    { question: "옥수수 가격 동향?", answer: "가뭄으로 인해 5% 상승 예상" }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Today's Market Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center">
            📈 오늘의 시장 한눈에 보기
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-800">주요 시장 동향</h4>
              {sentimentAlert && (
                <div className="flex items-center space-x-2 p-2 bg-white rounded-lg">
                  {sentimentAlert.scoreChange >= 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    <strong>{sentimentAlert.commodity}</strong> 센티먼트 <strong>{Math.abs(sentimentAlert.scoreChange)}</strong>점 변동
                  </span>
                </div>
              )}
              {commodities && commodities.length > 0 && (
                <div className="flex items-center space-x-2 p-2 bg-white rounded-lg">
                  {commodities[0].priceChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    <strong>{commodities[0].name}</strong> 가격 <strong>{Math.abs(commodities[0].priceChange)}%</strong> 
                    {commodities[0].priceChange >= 0 ? ' 상승' : ' 하락'}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-800">🔑 핵심 키워드</h4>
              <div className="flex flex-wrap gap-2">
                {['가뭄', '공급부족', '안전자산', '인플레이션', '전기차'].map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Conversations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center">
            💭 최근 대화 기록
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentConversations.map((conv, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-sm font-medium text-gray-900 mb-1">Q: {conv.question}</div>
                <div className="text-xs text-gray-600">A: {conv.answer}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Bot className="w-4 h-4 mr-2" />
            채팅
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages Area */}
          <div className="h-80 overflow-y-auto p-3 bg-gray-50 rounded-lg space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                {message.type === 'bot' ? (
                  <>
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-3 max-w-md">
                      <p className="text-gray-800 text-sm">{message.content}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1"></div>
                    <div className="bg-blue-600 text-white rounded-lg shadow-sm p-3 max-w-md">
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-lg shadow-sm p-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-gray-600 text-sm">AI가 답변을 생성하고 있습니다...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <form onSubmit={handleInputSubmit} className="flex space-x-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="예: 이번 주 밀 가격이 왜 떨어졌나요?"
                className="flex-1"
                disabled={chatMutation.isPending}
              />
              <Button 
                type="submit" 
                disabled={!inputValue.trim() || chatMutation.isPending}
                className="px-6"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>전송</span>
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Questions */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">💡 추천 질문:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSubmit(question)}
                    disabled={chatMutation.isPending}
                    className="text-sm hover:bg-blue-50"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
