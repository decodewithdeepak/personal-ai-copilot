'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Bot, User, Loader2 } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface ChatMessage {
    id: string;
    message: string;
    response: string;
    timestamp: string;
    isUser: boolean;
}

interface ChatInterfaceProps {
    socket: Socket | null;
}

export default function ChatInterface({ socket }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        loadChatHistory();
        scrollToBottom();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChatHistory = async () => {
        try {
            const response = await fetch(`${API_URL}/api/chat/history?limit=10`);
            const data = await response.json();

            if (data.success && data.data) {
                const formattedMessages: ChatMessage[] = [];

                data.data.forEach((item: any) => {
                    // Add user message
                    formattedMessages.push({
                        id: `user-${item.id}`,
                        message: item.message,
                        response: '',
                        timestamp: item.created_at,
                        isUser: true
                    });

                    // Add bot response
                    formattedMessages.push({
                        id: `bot-${item.id}`,
                        message: '',
                        response: item.response,
                        timestamp: item.created_at,
                        isUser: false
                    });
                });

                setMessages(formattedMessages.reverse());
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            message: input,
            response: '',
            timestamp: new Date().toISOString(),
            isUser: true
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/chat/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: currentInput,
                    userId: 1,
                    conversationId: Date.now().toString()
                })
            });

            const data = await response.json();

            if (data.success) {
                const botMessage: ChatMessage = {
                    id: `bot-${Date.now()}`,
                    message: '',
                    response: data.response,
                    timestamp: new Date().toISOString(),
                    isUser: false
                };

                setMessages(prev => [...prev, botMessage]);
            } else {
                // Add error message
                const errorMessage: ChatMessage = {
                    id: `error-${Date.now()}`,
                    message: '',
                    response: 'Sorry, I encountered an error processing your request. Please try again.',
                    timestamp: new Date().toISOString(),
                    isUser: false
                };

                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error('Error sending message:', error);

            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                message: '',
                response: 'Network error. Please check your connection and try again.',
                timestamp: new Date().toISOString(),
                isUser: false
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatMessage = (text: string) => {
        // Simple formatting for better readability
        return text
            .split('\n')
            .map((line, index) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                    return <strong key={index} className="text-white">{line.slice(2, -2)}</strong>;
                }
                if (line.startsWith('- ')) {
                    return <li key={index} className="ml-4 list-disc">{line.slice(2)}</li>;
                }
                return <p key={index} className="mb-1">{line}</p>;
            });
    };

    const suggestedQueries = [
        "What are my priorities today?",
        "Generate my daily briefing",
        "Show me my completed tasks",
        "Any scheduling conflicts?",
        "What's the weather like?",
        "Latest technology news"
    ];

    return (
        <Card className="bg-black border-zinc-800 flex flex-col h-[600px]">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    <CardTitle className="text-white">AI Assistant</CardTitle>
                </div>
                <CardDescription className="text-zinc-400">
                    Ask me anything about your tasks, schedule, or get insights
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-8">
                            <Bot className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                            <p className="text-zinc-400 mb-4">Start a conversation with your AI assistant</p>

                            <div className="space-y-2">
                                <p className="text-sm text-zinc-500 mb-2">Try asking:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {suggestedQueries.map((query, index) => (
                                        <Button
                                            key={index}
                                            onClick={() => setInput(query)}
                                            variant="outline"
                                            size="sm"
                                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-left justify-start"
                                        >
                                            {query}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.isUser ? 'bg-blue-600' : 'bg-green-600'
                                    }`}>
                                    {msg.isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>

                                <div className={`flex-1 max-w-[70%] ${msg.isUser ? 'text-right' : 'text-left'}`}>
                                    <div className={`p-3 rounded-lg ${msg.isUser
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-zinc-800 text-zinc-200'
                                        }`}>
                                        <div className="prose prose-invert max-w-none text-sm">
                                            {msg.isUser ? (
                                                <p>{msg.message}</p>
                                            ) : (
                                                formatMessage(msg.response)
                                            )}
                                        </div>
                                    </div>
                                    <div className={`text-xs text-zinc-500 mt-1 ${msg.isUser ? 'text-right' : 'text-left'
                                        }`}>
                                        {formatTimestamp(msg.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {loading && (
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <div className="p-3 rounded-lg bg-zinc-800 text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">AI is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-zinc-800 p-4">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask your AI assistant anything..."
                            disabled={loading}
                            className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 flex-1"
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                        Press Enter to send • Powered by CrewAI agents and RAG
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
