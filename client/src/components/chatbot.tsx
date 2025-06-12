import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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

  const quickQuestions = [
    "옥수수 가격이 오르는 이유는?",
    "금 투자가 유리한 시점인가요?",
    "구리 센티먼트가 좋은 이유는?"
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          AI 시장 분석 챗봇
        </h2>
        <p className="text-sm text-gray-600">시장 상황에 대해 궁금한 점을 물어보세요</p>
      </div>

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
              <p className="text-sm text-gray-600 font-medium">자주 묻는 질문:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSubmit(question)}
                    disabled={chatMutation.isPending}
                    className="text-sm"
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
