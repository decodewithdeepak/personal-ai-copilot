'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Plus, Check, Trash2 } from 'lucide-react';

interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: 'high' | 'medium' | 'low';
    due_date: string;
    created_at: string;
}

interface TasksCardProps {
    tasks: Task[];
    onTaskCreate: (taskData: any) => void;
    onTaskUpdate: (taskId: number, updates: any) => void;
    API_URL: string;
}

export default function TasksCard({ tasks, onTaskCreate, onTaskUpdate, API_URL }: TasksCardProps) {
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
    const [isCreating, setIsCreating] = useState(false);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const createTask = async () => {
        if (!newTask.title.trim() || isCreating) return;

        setIsCreating(true);
        try {
            const response = await fetch(`${API_URL}/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTask.title,
                    description: newTask.description,
                    priority: newTask.priority,
                    due_date: newTask.due_date || null,
                    userId: 1
                })
            });
            const data = await response.json();
            if (data.success) {
                onTaskCreate(data.data);
                setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
            } else {
                console.error('Task creation failed:', data.error);
            }
        } catch (error) {
            console.error('Error creating task:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const completeTask = async (taskId: number) => {
        try {
            const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' })
            });
            const data = await response.json();
            if (data.success) {
                onTaskUpdate(taskId, { status: 'completed' });
            }
        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    const deleteTask = async (taskId: number) => {
        try {
            console.log('Deleting task:', taskId); // Debug log
            const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            console.log('Delete response:', data); // Debug log

            if (data.success) {
                // Trigger a refresh by calling onTaskUpdate with a special flag
                onTaskUpdate(taskId, { deleted: true });
            } else {
                console.error('Delete failed:', data.error);
                alert('Failed to delete task: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error deleting task: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    return (
        <Card className="bg-zinc-950 border-zinc-800 h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-white">Tasks</CardTitle>
                </div>
                <CardDescription className="text-zinc-400">
                    Manage your daily tasks and priorities
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
                {/* Create Task Form */}
                <div className="space-y-3 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                    <Input
                        placeholder="Task title..."
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                    />
                    <Textarea
                        placeholder="Description (optional)..."
                        value={newTask.description}
                        onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 resize-none"
                        rows={2}
                    />
                    <div className="relative">
                        <Input
                            type="date"
                            value={newTask.due_date}
                            onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                            className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 pl-20"
                        />
                        <label className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">
                            Due Date:
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={newTask.priority}
                            onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                            className="bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-1 text-sm"
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                        <Button
                            onClick={createTask}
                            size="sm"
                            disabled={isCreating || !newTask.title.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            {isCreating ? 'Adding...' : 'Add Task'}
                        </Button>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                    {tasks.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-zinc-500 text-center">No tasks yet. Create your first task above!</p>
                        </div>
                    ) : (
                        tasks
                            .filter((task, index, self) => self.findIndex(t => t.id === task.id) === index) // Remove duplicates
                            .map((task, index) => (
                                <div
                                    key={`task-${task.id}-${index}`} // Ensure unique keys
                                    className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-medium text-white truncate">{task.title}</h3>
                                                <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                                                    {task.priority}
                                                </Badge>
                                            </div>
                                            {task.description && (
                                                <p className="text-zinc-400 text-sm mb-2 line-clamp-2">{task.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <span className={`inline-block w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' :
                                                    task.status === 'in_progress' ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}></span>
                                                <span>{task.status}</span>
                                                {task.due_date && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{new Date(task.due_date).toLocaleDateString()}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 ml-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => completeTask(task.id)}
                                                disabled={task.status === 'completed'}
                                                className={`h-8 w-8 p-0 ${task.status === 'completed'
                                                    ? 'text-green-500 cursor-not-allowed'
                                                    : 'text-zinc-400 hover:text-green-500 hover:bg-green-500/10'
                                                    }`}
                                                title={task.status === 'completed' ? 'Already completed' : 'Mark as complete'}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => deleteTask(task.id)}
                                                className="h-8 w-8 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                                                title="Delete task"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
