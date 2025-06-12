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
    <div className="h-screen overflow-hidden p-6">
      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-6 h-full">
        
        {/* Left Column - Main Chat Area (2/3 width) */}
        <div className="col-span-2 flex flex-col">
          {/* Chat Interface */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bot className="w-5 h-5 mr-2" />
                  AI 시장 분석 챗봇
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleSpeechInput}>
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-6">
              {/* Chat Messages - Takes up most space */}
              <div className="flex-1 mb-4 overflow-y-auto p-4 bg-gray-50 rounded-lg space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-900 shadow-sm border'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'bot' && <Bot className="w-4 h-4 mt-1 flex-shrink-0 text-blue-600" />}
                        {message.type === 'user' && <User className="w-4 h-4 mt-1 flex-shrink-0" />}
                        <div className="flex-1">
                          <div 
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ 
                              __html: message.type === 'bot' ? formatMessageContent(message.content) : message.content 
                            }}
                          />
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {message.type === 'bot' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                onClick={() => handleSpeechOutput(message.content)}
                              >
                                <Volume2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-900 px-4 py-3 rounded-lg shadow-sm border">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-sm">분석 중...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested Questions - Fixed at bottom */}
              <div className="mb-4 flex-shrink-0">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  💡 오늘의 추천 질문
                </h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      onClick={() => {
                        setInputValue(question);
                        handleSubmit(question);
                      }}
                      disabled={chatMutation.isPending}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input Area - Fixed at bottom */}
              <div className="flex space-x-2 flex-shrink-0">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="시장 동향이나 상품 분석에 대해 질문해보세요..."
                  onKeyPress={(e) => e.key === 'Enter' && !chatMutation.isPending && inputValue.trim() && handleSubmit(inputValue)}
                  disabled={chatMutation.isPending}
                  className="flex-1"
                />
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleSpeechInput}
                  disabled={chatMutation.isPending}
                  className="px-3"
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => handleSubmit(inputValue)} 
                  disabled={chatMutation.isPending || !inputValue.trim()}
                  className="px-4"
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar Information (1/3 width) */}
        <div className="space-y-4 overflow-y-auto">
          
          {/* Today's Market Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center">
                📈 오늘의 시장 한눈에 보기
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-gray-800 mb-2">주요 시장 동향</h4>
                  {sentimentAlert && (
                    <div className="flex items-center space-x-2 p-2 bg-white rounded-lg mb-2">
                      {sentimentAlert.scoreChange >= 0 ? (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-xs">
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
                      <span className="text-xs">
                        <strong>{commodities[0].name}</strong> 가격 <strong>{Math.abs(commodities[0].priceChange)}%</strong> 
                        {commodities[0].priceChange >= 0 ? ' 상승' : ' 하락'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-800 mb-2">🔑 핵심 키워드</h4>
                  <div className="flex flex-wrap gap-1">
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
              <div className="space-y-3">
                {recentConversations.map((conv, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="text-sm font-medium text-gray-900 mb-1">Q: {conv.question}</div>
                    <div className="text-xs text-gray-600">A: {conv.answer}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
