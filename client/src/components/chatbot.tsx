import React, { useState, useRef, useEffect } from "react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch market data for today's summary
  const { data: commodities } = useQuery<Commodity[]>({
    queryKey: ["/api/commodities"]
  });

  const { data: sentimentAlert } = useQuery<any>({
    queryKey: ["/api/sentiment-alert"]
  });

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    <div className="w-screen h-screen max-w-[1920px] max-h-[1080px] mx-auto overflow-hidden">
      {/* Two Column Layout - No Scroll */}
      <div className="grid grid-cols-3 gap-8 h-full p-8">
        
        {/* Left Column - Chat Area (2/3 width) */}
        <div className="col-span-2 flex flex-col">
          
          {/* Chat Header */}
          <Card className="mb-6 flex-shrink-0 bg-white rounded-lg shadow p-6">
            <CardHeader className="pb-0 p-0">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bot className="w-6 h-6 mr-3 text-blue-600" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">AI 시장 분석 챗봇</h1>
                    <p className="text-sm text-gray-600 font-normal">실시간 시장 데이터와 전문가 분석을 기반으로 답변드립니다</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleSpeechInput}>
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Chat Container - Fixed Height */}
          <Card className="flex-1 flex flex-col min-h-0 bg-white rounded-lg shadow">
            <CardContent className="p-6 flex flex-col h-full">
              
              {/* Chat Messages - Fixed Height with Scroll */}
              <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg space-y-4 max-h-[700px]">
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
                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions - Limited to 2 lines */}
              {messages.length === 0 && (
                <div className="mb-4 flex-shrink-0">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">추천 질문</h4>
                  <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors flex-shrink-0"
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
              )}

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
        <div className="col-span-1 flex flex-col space-y-6">
          
          {/* Today's Market Summary */}
          <Card className="bg-white rounded-lg shadow p-6">
            <CardHeader className="pb-4 p-0">
              <CardTitle className="text-lg font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                오늘의 시장
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {sentimentAlert && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    {sentimentAlert.scoreChange >= 0 ? (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-600" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {sentimentAlert.commodity}
                      </p>
                      <p className="text-xs text-gray-600">
                        점수: {sentimentAlert.currentScore} ({sentimentAlert.scoreChange >= 0 ? '+' : ''}{sentimentAlert.scoreChange})
                      </p>
                    </div>
                  </div>
                )}
                
                {commodities && commodities.slice(0, 5).map((commodity, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{commodity.name}</span>
                    <div className="flex items-center space-x-1">
                      <span className={`text-sm font-medium ${commodity.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {commodity.priceChange >= 0 ? '+' : ''}{commodity.priceChange}%
                      </span>
                      {commodity.priceChange >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Keywords */}
          <Card className="bg-white rounded-lg shadow p-6">
            <CardHeader className="pb-4 p-0">
              <CardTitle className="text-lg font-semibold">핵심 키워드</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-wrap gap-2">
                {['가뭄', '공급부족', '안전자산', '인플레이션', '전기차', '지정학'].map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related News */}
          <Card className="flex-1 min-h-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center">
                📰 관련 뉴스
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1 h-full">
              <div className="space-y-2 h-full overflow-y-auto" style={{ maxHeight: '300px' }}>
                {[
                  {
                    id: 1,
                    title: "글로벌 밀 공급 부족 우려 심화",
                    summary: "우크라이나 전쟁 장기화로 밀 수출 차질",
                    sentiment: "부정적",
                    time: "2시간 전"
                  },
                  {
                    id: 2,
                    title: "구리 가격 급등, 전기차 수요 급증",
                    summary: "중국 전기차 생산량 증가로 구리 수요 폭증",
                    sentiment: "긍정적",
                    time: "4시간 전"
                  },
                  {
                    id: 3,
                    title: "금값 상승세, 인플레이션 우려 확산",
                    summary: "연준 금리 정책 불확실성으로 안전자산 선호",
                    sentiment: "중립적",
                    time: "6시간 전"
                  },
                  {
                    id: 4,
                    title: "WTI 원유 70달러 돌파 전망",
                    summary: "OPEC+ 감산 정책으로 공급 제한 지속",
                    sentiment: "긍정적",
                    time: "8시간 전"
                  }
                ].map((news) => (
                  <div 
                    key={news.id} 
                    className="border rounded-lg p-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      console.log('Navigate to news:', news.id);
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="text-xs font-medium text-gray-900 line-clamp-2">{news.title}</h5>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ml-1 ${
                          news.sentiment === '긍정적' ? 'bg-green-100 text-green-800' :
                          news.sentiment === '부정적' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {news.sentiment}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{news.summary}</p>
                    <p className="text-xs text-gray-500">{news.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Conversations */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center">
                💭 최근 대화 기록
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="space-y-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {recentConversations.slice(0, 3).map((conv, index) => (
                  <div key={index} className="border rounded-lg p-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="text-xs font-medium text-gray-900 mb-1">Q: {conv.question}</div>
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
