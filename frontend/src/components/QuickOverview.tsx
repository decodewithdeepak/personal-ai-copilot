'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Activity, Clock, TrendingUp } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string;
  created_at: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
}

interface QuickOverviewProps {
  socket: Socket | null;
}

export default function QuickOverview({ socket }: QuickOverviewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [automationStatus, setAutomationStatus] = useState<'active' | 'inactive' | 'error'>('inactive');
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    loadOverviewData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('task_created', (data) => {
        setTasks(prev => [data.task, ...prev]);
      });

      socket.on('task_updated', (data) => {
        setTasks(prev => prev.map(task =>
          task.id === data.task.id ? data.task : task
        ));
      });

      socket.on('notification', (data) => {
        setNotifications(prev => [data, ...prev]);
      });

      socket.on('automation_status', (data) => {
        setAutomationStatus(data.status);
      });

      return () => {
        socket.off('task_created');
        socket.off('task_updated');
        socket.off('notification');
        socket.off('automation_status');
      };
    }
  }, [socket]);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      // Load tasks
      const tasksResponse = await fetch(`${API_URL}/api/tasks`);
      const tasksData = await tasksResponse.json();
      if (tasksData.success) {
        setTasks(tasksData.data);
      }

      // Load notifications
      const notificationsResponse = await fetch(`${API_URL}/api/notifications`);
      const notificationsData = await notificationsResponse.json();
      if (notificationsData.success) {
        setNotifications(notificationsData.data);
      }

      // Check automation status (mock for now)
      setAutomationStatus('active');
    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletedTasks = () => {
    return tasks.filter(task => task.status === 'completed').length;
  };

  const getPendingTasks = () => {
    return tasks.filter(task => task.status === 'pending' || task.status === 'in_progress').length;
  };

  const getOverdueTasks = () => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      const now = new Date();
      return dueDate < now && task.status !== 'completed';
    }).length;
  };

  const getTodayTasks = () => {
    const today = new Date().toDateString();
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date).toDateString();
      return taskDate === today;
    }).length;
  };

  return (
    <Card className="bg-zinc-950 border border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Quick Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-zinc-400 text-center py-4">Loading...</div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total Tasks
              </span>
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-200">
                {tasks.length}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Completed
              </span>
              <Badge className="bg-green-500">
                {getCompletedTasks()}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </span>
              <Badge className="bg-yellow-500">
                {getPendingTasks()}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">High Priority</span>
              <Badge className="bg-red-500">
                {tasks.filter(t => t.priority === 'high').length}
              </Badge>
            </div>

            {getOverdueTasks() > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Overdue</span>
                <Badge className="bg-red-600">
                  {getOverdueTasks()}
                </Badge>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Due Today</span>
              <Badge className="bg-orange-500">
                {getTodayTasks()}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Unread Notifications</span>
              <Badge className="bg-blue-500">
                {notifications.filter(n => !n.read).length}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Automation</span>
              <Badge 
                className={
                  automationStatus === 'active' 
                    ? 'bg-green-500' 
                    : automationStatus === 'error' 
                    ? 'bg-red-500' 
                    : 'bg-gray-500'
                }
              >
                {automationStatus}
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
