'use client';

import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import TasksCard from '@/components/dashboard/TasksCard';
import AIAssistantCard from '@/components/dashboard/AIAssistantCard';
import DailyBriefingCard from '@/components/dashboard/DailyBriefingCard';
import NotificationsCard from '@/components/dashboard/NotificationsCard';

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
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [briefing, setBriefing] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Chat session management
  const restoreOrCreateChatSession = () => {
    const savedSessionId = localStorage.getItem('current_chat_session');
    const savedMessages = localStorage.getItem('chat_messages');

    if (savedSessionId && savedMessages) {
      setCurrentSessionId(savedSessionId);
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setChatMessages(parsedMessages);
        console.log(`🔄 Restored chat session: ${savedSessionId} with ${parsedMessages.length} messages`);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
        createNewChatSession();
      }
    } else {
      createNewChatSession();
    }
  };

  const createNewChatSession = () => {
    const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentSessionId(newSessionId);
    setChatMessages([]);

    localStorage.setItem('current_chat_session', newSessionId);
    localStorage.removeItem('chat_messages');
    console.log(`🆕 New chat session created: ${newSessionId}`);
  };

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io(API_URL);
    setSocket(socketInstance);

    // Restore existing chat session or create new one
    restoreOrCreateChatSession();

    // Load initial data
    loadTasks();
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

    return () => {
      socketInstance.disconnect();
    };
  }, [API_URL]);

  // Save chat messages to localStorage whenever they change
  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

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
      if (data.success && data.data.content) {
        setBriefing(data.data.content);
      }
    } catch (error) {
      console.error('Error loading briefing:', error);
    }
  };

  const generateBriefing = async () => {
    try {
      const response = await fetch(`${API_URL}/api/briefing/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1 })
      });
      const data = await response.json();
      if (data.success) {
        setBriefing(data.briefing);
      }
    } catch (error) {
      console.error('Error generating briefing:', error);
    }
  };

  const handleTaskCreate = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const handleTaskUpdate = (taskId: number, updates: any) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Personal AI Copilot</h1>
          </div>
          <p className="text-zinc-400">Your intelligent assistant for productivity and insights</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Briefing */}
          <div className="lg:col-span-2">
            <DailyBriefingCard
              briefing={briefing}
              onGenerateBriefing={generateBriefing}
              API_URL={API_URL}
            />
          </div>

          {/* Quick Stats/Notifications */}
          <div className="lg:col-span-1">
            <NotificationsCard
              notifications={notifications}
              API_URL={API_URL}
            />
          </div>

          {/* Tasks */}
          <div className="lg:col-span-1">
            <TasksCard
              tasks={tasks}
              onTaskCreate={handleTaskCreate}
              onTaskUpdate={handleTaskUpdate}
              API_URL={API_URL}
            />
          </div>

          {/* AI Assistant */}
          <div className="lg:col-span-2">
            <AIAssistantCard
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              currentSessionId={currentSessionId}
              onCreateNewChat={createNewChatSession}
              API_URL={API_URL}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
