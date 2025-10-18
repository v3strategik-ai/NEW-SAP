import { useState } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AIAssistant = ({ user, onLogout }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m Agentix AI, your intelligent assistant for the ERP system. I can help you analyze data, generate insights, and answer questions about your business. What would you like to know?'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSendQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setMessages([...messages, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/ai/query`,
        { query, context: 'Dashboard query' },
        { headers: getAuthHeader() }
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get AI response');
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="ai-assistant-page">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-600" />
            AI Assistant
          </h1>
          <p className="text-gray-600 text-lg mt-1">Get intelligent insights and answers powered by AI</p>
        </div>

        <Card className="h-[600px] flex flex-col border-0 shadow-lg" data-testid="chat-container">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Chat with AI
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="messages-container">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${index}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4" />
                        <span className="text-xs font-semibold">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-4 bg-gray-50">
              <form onSubmit={handleSendQuery} className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything about your business data..."
                  disabled={loading}
                  className="flex-1 h-11"
                  data-testid="query-input"
                />
                <Button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-11 px-6"
                  data-testid="send-button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Show me sales trends', 'Top performing products', 'Revenue forecast'].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(suggestion)}
                    className="text-xs px-3 py-1.5 bg-white border rounded-full hover:bg-gray-50 transition-colors"
                    disabled={loading}
                    data-testid={`suggestion-${index}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AIAssistant;