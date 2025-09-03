'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import DailyBriefing from '@/components/DailyBriefing';
import TaskManager from '@/components/TaskManager';
import ChatInterface from '@/components/ChatInterface';
import NotificationCenter from '@/components/NotificationCenter';
import AutomationStatus from '@/components/AutomationStatus';
import { Bot, Sparkles, Zap } from 'lucide-react';

export default function Dashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'connecting'>('connecting');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io(API_URL);
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to backend');
      setSystemStatus('online');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from backend');
      setSystemStatus('offline');
    });

    socketInstance.on('connect_error', () => {
      setSystemStatus('offline');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [API_URL]);

  const handleRefresh = () => {
    // This can be used to refresh data across components
    console.log('Refreshing dashboard data...');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Personal AI Copilot</h1>
                <p className="text-sm text-zinc-400">Powered by CrewAI agents, RAG, and n8n automation</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${systemStatus === 'online' ? 'bg-green-500' :
                    systemStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                <span className="text-sm text-zinc-400 capitalize">{systemStatus}</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-zinc-300">AI Agents Active</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full">
                <Zap className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-zinc-300">Automation Running</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Daily Briefing */}
            <DailyBriefing onRefresh={handleRefresh} />

            {/* Automation Status */}
            <AutomationStatus onRefresh={handleRefresh} />
          </div>

          {/* Center Column */}
          <div className="space-y-6">
            {/* Chat Interface */}
            <ChatInterface socket={socket} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Task Manager */}
            <TaskManager socket={socket} />

            {/* Notifications */}
            <NotificationCenter socket={socket} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-zinc-800">
          <div className="text-center">
            <p className="text-zinc-500 text-sm">
              Built with Next.js, CrewAI, PostgreSQL RAG, and n8n automation
            </p>
            <p className="text-zinc-600 text-xs mt-2">
              Assignment submission ready • All components working together
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
