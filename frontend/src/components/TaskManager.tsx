'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Plus, Calendar, AlertCircle, Clock } from 'lucide-react';
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

interface TaskManagerProps {
    socket: Socket | null;
}

export default function TaskManager({ socket }: TaskManagerProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'high' | 'medium' | 'low',
        due_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        loadTasks();

        // Socket listeners for real-time updates
        if (socket) {
            socket.on('task_created', (data) => {
                setTasks(prev => [data.task, ...prev]);
            });

            socket.on('task_updated', (data) => {
                setTasks(prev => prev.map(task =>
                    task.id === data.task.id ? data.task : task
                ));
            });

            socket.on('task_deleted', (data) => {
                setTasks(prev => prev.filter(task => task.id !== data.taskId));
            });
        }

        return () => {
            if (socket) {
                socket.off('task_created');
                socket.off('task_updated');
                socket.off('task_deleted');
            }
        };
    }, [socket]);

    const loadTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/api/tasks`);
            const data = await response.json();
            if (data.success) {
                setTasks(data.data || []);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    const createTask = async () => {
        if (!newTask.title.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTask,
                    user_id: 1
                })
            });

            const data = await response.json();
            if (data.success) {
                setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
                setShowAddForm(false);
                // Task will be added via socket event
            }
        } catch (error) {
            console.error('Error creating task:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (taskId: number, status: string) => {
        try {
            const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                // Task will be updated via socket event
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteTask = async (taskId: number) => {
        try {
            const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Task will be removed via socket event
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-600 text-white';
            case 'medium': return 'bg-yellow-600 text-white';
            case 'low': return 'bg-green-600 text-white';
            default: return 'bg-zinc-600 text-white';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-600 text-white';
            case 'in_progress': return 'bg-blue-600 text-white';
            case 'pending': return 'bg-zinc-600 text-white';
            default: return 'bg-zinc-600 text-white';
        }
    };

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date() && dueDate;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    const priorityTasks = tasks.filter(task => task.priority === 'high' && task.status !== 'completed');
    const completedCount = tasks.filter(task => task.status === 'completed').length;
    const pendingCount = tasks.filter(task => task.status !== 'completed').length;

    return (
        <Card className="bg-black border-zinc-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5 text-green-400" />
                        <CardTitle className="text-white">Task Manager</CardTitle>
                    </div>
                    <Button
                        onClick={() => setShowAddForm(!showAddForm)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Task
                    </Button>
                </div>
                <CardDescription className="text-zinc-400">
                    {pendingCount} pending • {completedCount} completed
                    {priorityTasks.length > 0 && (
                        <span className="ml-2 text-red-400">• {priorityTasks.length} high priority</span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {showAddForm && (
                    <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700 space-y-3">
                        <Input
                            placeholder="Task title"
                            value={newTask.title}
                            onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                        <Textarea
                            placeholder="Task description (optional)"
                            value={newTask.description}
                            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            rows={2}
                        />
                        <div className="flex gap-2">
                            <select
                                value={newTask.priority}
                                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                            <Input
                                type="date"
                                value={newTask.due_date}
                                onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={createTask}
                                disabled={loading || !newTask.title.trim()}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {loading ? 'Creating...' : 'Create Task'}
                            </Button>
                            <Button
                                onClick={() => setShowAddForm(false)}
                                variant="outline"
                                className="border-zinc-700 text-white hover:bg-zinc-800"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {tasks.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckSquare className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-400">No tasks yet. Create your first task!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className={`p-4 rounded-lg border transition-all ${task.status === 'completed'
                                        ? 'bg-zinc-900/50 border-zinc-700 opacity-75'
                                        : 'bg-zinc-900 border-zinc-700 hover:border-zinc-600'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-zinc-500' : 'text-white'
                                                }`}>
                                                {task.title}
                                            </h4>
                                            <Badge className={getPriorityColor(task.priority)}>
                                                {task.priority}
                                            </Badge>
                                            <Badge className={getStatusColor(task.status)}>
                                                {task.status.replace('_', ' ')}
                                            </Badge>
                                            {task.due_date && isOverdue(task.due_date) && task.status !== 'completed' && (
                                                <Badge className="bg-red-600 text-white">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Overdue
                                                </Badge>
                                            )}
                                        </div>
                                        {task.description && (
                                            <p className="text-zinc-400 text-sm mb-2">{task.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                                            {task.due_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Due: {formatDate(task.due_date)}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Created: {formatDate(task.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        {task.status !== 'completed' && (
                                            <Button
                                                onClick={() => updateTaskStatus(task.id, 'completed')}
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Complete
                                            </Button>
                                        )}
                                        {task.status === 'completed' && (
                                            <Button
                                                onClick={() => updateTaskStatus(task.id, 'pending')}
                                                size="sm"
                                                variant="outline"
                                                className="border-zinc-700 text-white hover:bg-zinc-800"
                                            >
                                                Reopen
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => deleteTask(task.id)}
                                            size="sm"
                                            variant="outline"
                                            className="border-red-700 text-red-400 hover:bg-red-900/20"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
