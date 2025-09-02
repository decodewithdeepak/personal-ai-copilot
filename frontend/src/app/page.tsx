'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Calendar,
  CheckSquare,
  Bell,
  Plus,
  Send,
  Bot,
  User,
  Sparkles,
  Clock
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: string;
  isUser: boolean;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [briefing, setBriefing] = useState<string>('');
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io(API_URL);
    setSocket(socketInstance);

    // Load initial data
    loadTasks();
    loadChatHistory();
    loadNotifications();
    loadTodaysBriefing();

    // Socket event listeners
    socketInstance.on('task_created', (data) => {
      setTasks(prev => [data.task, ...prev]);
    });

    socketInstance.on('task_updated', (data) => {
      setTasks(prev => prev.map(task =>
        task.id === data.task.id ? data.task : task
      ));
    });

    socketInstance.on('notification', (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    socketInstance.on('chat_response', (data) => {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        message: data.message,
        response: data.response,
        timestamp: data.timestamp,
        isUser: false
      }]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [API_URL]);

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tasks`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/history`);
      const data = await response.json();
      if (data.success) {
        const formattedMessages = data.data.map((item: any) => ({
          id: Date.now().toString() + Math.random(),
          message: item.message,
          response: item.response,
          timestamp: item.created_at,
          isUser: false
        }));
        setChatMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadTodaysBriefing = async () => {
    try {
      const response = await fetch(`${API_URL}/api/briefing/today`);
      const data = await response.json();
      if (data.success && data.data) {
        setBriefing(JSON.parse(data.data.content).briefing);
      }
    } catch (error) {
      console.error('Error loading briefing:', error);
    }
  };

  const generateBriefing = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/briefing/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1 })
      });
      const data = await response.json();
      if (data.success) {
        setBriefing(data.data.briefing);
      }
    } catch (error) {
      console.error('Error generating briefing:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      const data = await response.json();
      if (data.success) {
        setNewTask({ title: '', description: '', priority: 'medium' });
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      message: chatInput,
      response: '',
      timestamp: new Date().toISOString(),
      isUser: true
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput, userId: 1 })
      });
      const data = await response.json();
      if (data.success) {
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          message: data.data.message,
          response: data.data.response,
          timestamp: new Date().toISOString(),
          isUser: false
        }]);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Bot className="h-8 w-8 text-purple-400" />
            Personal AI Copilot
          </h1>
          <p className="text-slate-300">Your intelligent assistant for productivity and insights</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Briefing */}
          <Card className="lg:col-span-2 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                Daily Briefing
              </CardTitle>
              <CardDescription className="text-slate-300">
                AI-generated insights and priorities for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {briefing ? (
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-slate-200 font-sans">
                    {briefing}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">No briefing generated yet</p>
                  <Button
                    onClick={generateBriefing}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? 'Generating...' : 'Generate Daily Briefing'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                Quick Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Tasks</span>
                <Badge variant="secondary">{tasks.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">High Priority</span>
                <Badge className="bg-red-500">
                  {tasks.filter(t => t.priority === 'high').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Unread Notifications</span>
                <Badge className="bg-orange-500">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Management */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-green-400" />
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Task title..."
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                  />
                  <Textarea
                    placeholder="Description (optional)..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="flex-1 bg-white/5 border border-white/20 rounded-md px-3 py-2 text-white"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <Button onClick={createTask} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm">{task.title}</h4>
                          {task.description && (
                            <p className="text-slate-400 text-xs mt-1">{task.description}</p>
                          )}
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} ml-2 mt-1`} />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {task.status}
                        </Badge>
                        {task.due_date && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Chat */}
          <Card className="lg:col-span-2 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                AI Assistant
              </CardTitle>
              <CardDescription className="text-slate-300">
                Chat with your AI copilot for insights and assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 overflow-y-auto space-y-3 bg-white/5 rounded-lg p-4 border border-white/10">
                  {chatMessages.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">
                      Start a conversation with your AI assistant
                    </p>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className="space-y-2">
                        {msg.isUser ? (
                          <div className="flex justify-end">
                            <div className="flex items-start gap-2 max-w-xs">
                              <div className="bg-purple-600 text-white p-2 rounded-lg text-sm">
                                {msg.message}
                              </div>
                              <User className="h-6 w-6 text-purple-400 mt-1" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-start">
                            <div className="flex items-start gap-2 max-w-lg">
                              <Bot className="h-6 w-6 text-blue-400 mt-1" />
                              <div className="bg-white/10 text-white p-2 rounded-lg text-sm">
                                <div className="font-medium text-blue-300 mb-1">You:</div>
                                <div className="mb-2">{msg.message}</div>
                                <div className="font-medium text-green-300 mb-1">AI:</div>
                                <div>{msg.response}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-2">
                        <Bot className="h-6 w-6 text-blue-400 mt-1" />
                        <div className="bg-white/10 text-white p-2 rounded-lg text-sm">
                          AI is thinking...
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
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
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
        </div>
      </div>
    </div>
  );
}
