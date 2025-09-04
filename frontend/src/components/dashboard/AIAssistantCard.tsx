'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Bot, User, Plus } from 'lucide-react';

interface ChatMessage {
    id: string;
    message: string;
    response: string;
    timestamp: string;
    isUser: boolean;
}

interface AIAssistantCardProps {
    chatMessages: ChatMessage[];
    setChatMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
    currentSessionId: string;
    onCreateNewChat: () => void;
    API_URL: string;
}

export default function AIAssistantCard({
    chatMessages,
    setChatMessages,
    currentSessionId,
    onCreateNewChat,
    API_URL
}: AIAssistantCardProps) {
    const [chatInput, setChatInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendChatMessage = async () => {
        if (!chatInput.trim()) return;

        const userMessage = {
            id: `${currentSessionId}_${Date.now()}`,
            message: chatInput,
            response: '',
            timestamp: new Date().toISOString(),
            isUser: true
        };

        setChatMessages(prev => [...prev, userMessage]);
        const currentMessage = chatInput;
        setChatInput('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: currentMessage,
                    userId: 1,
                    sessionId: currentSessionId
                })
            });
            const data = await response.json();
            if (data.success) {
                const aiMessage = {
                    id: `${currentSessionId}_${Date.now() + 1}`,
                    message: '',
                    response: data.data.response,
                    timestamp: new Date().toISOString(),
                    isUser: false
                };
                setChatMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error('Error sending chat message:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    };

    return (
        <Card className="bg-zinc-950 border-zinc-800 h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-purple-500" />
                        <CardTitle className="text-white">AI Assistant</CardTitle>
                    </div>
                    <Button
                        onClick={onCreateNewChat}
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-zinc-700 text-zinc-400 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all"
                        title="Start new chat session"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <CardDescription className="text-zinc-400">
                    Chat with your AI copilot for insights and assistance
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Session Indicator */}
                    {currentSessionId && (
                        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-2 mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-zinc-400">
                                    New Chat Session • {currentSessionId.split('_')[1] ? new Date(parseInt(currentSessionId.split('_')[1])).toLocaleTimeString() : 'Active'}
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto space-y-4 bg-zinc-900 rounded-lg p-4 border border-zinc-800 mb-3 min-h-0">
                        {chatMessages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-zinc-500 text-center">
                                    Start a conversation with your AI assistant
                                </p>
                            </div>
                        ) : (
                            chatMessages.map((msg) => (
                                msg.isUser ? (
                                    <div key={msg.id} className="flex justify-end">
                                        <div className="flex items-start gap-3 max-w-[70%]">
                                            <div className="bg-blue-600 text-white p-3 rounded-lg text-sm break-words">
                                                {msg.message}
                                            </div>
                                            <User className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                                        </div>
                                    </div>
                                ) : (
                                    <div key={msg.id} className="flex justify-start">
                                        <div className="flex items-start gap-3 max-w-[70%]">
                                            <Bot className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
                                            <div className="bg-zinc-800 text-white p-3 rounded-lg text-sm break-words">
                                                {msg.response}
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))
                        )}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex items-start gap-3 max-w-[70%]">
                                    <Bot className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
                                    <div className="bg-zinc-800 text-white p-3 rounded-lg text-sm">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ask me anything..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500"
                        />
                        <Button
                            onClick={sendChatMessage}
                            disabled={loading || !chatInput.trim()}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
