'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, RefreshCw, CheckCircle, XCircle, Clock, Settings } from 'lucide-react';

interface WorkflowStatus {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'running' | 'error';
    lastRun: string;
    nextRun?: string;
    executions: number;
    success_rate: number;
}

interface AutomationStatusProps {
    onRefresh?: () => void;
}

export default function AutomationStatus({ onRefresh }: AutomationStatusProps) {
    const [workflows, setWorkflows] = useState<WorkflowStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const N8N_URL = process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678';
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        loadWorkflowStatus();
        // Refresh every 30 seconds
        const interval = setInterval(loadWorkflowStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadWorkflowStatus = async () => {
        try {
            setError(null);

            // Mock data for now - in real app this would come from n8n API
            const mockWorkflows: WorkflowStatus[] = [
                {
                    id: 'daily-automation',
                    name: 'Daily AI Copilot Automation',
                    status: 'active',
                    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                    nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22 hours from now
                    executions: 147,
                    success_rate: 98.6
                },
                {
                    id: 'connection-test',
                    name: 'Backend Connection Test',
                    status: 'active',
                    lastRun: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
                    executions: 1,
                    success_rate: 100
                },
                {
                    id: 'data-sync',
                    name: 'Knowledge Base Sync',
                    status: 'running',
                    lastRun: new Date().toISOString(),
                    executions: 89,
                    success_rate: 95.5
                }
            ];

            setWorkflows(mockWorkflows);

            // Also check backend health for automation status
            const healthResponse = await fetch(`${API_URL}/health`);
            if (!healthResponse.ok) {
                setError('Backend connection issue');
            }

        } catch (error) {
            console.error('Error loading workflow status:', error);
            setError('Failed to load automation status');
        }
    };

    const refreshWorkflows = async () => {
        setLoading(true);
        await loadWorkflowStatus();
        setLoading(false);
        onRefresh?.();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-600 text-white';
            case 'running': return 'bg-blue-600 text-white';
            case 'inactive': return 'bg-zinc-600 text-white';
            case 'error': return 'bg-red-600 text-white';
            default: return 'bg-zinc-600 text-white';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4" />;
            case 'running': return <RefreshCw className="h-4 w-4 animate-spin" />;
            case 'inactive': return <Clock className="h-4 w-4" />;
            case 'error': return <XCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${Math.floor(diffInMinutes)}m ago`;
        } else if (diffInMinutes < 24 * 60) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const formatNextRun = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInHours * 60);
            return `in ${diffInMinutes}m`;
        } else if (diffInHours < 24) {
            return `in ${Math.floor(diffInHours)}h`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `in ${diffInDays}d`;
        }
    };

    const activeWorkflows = workflows.filter(w => w.status === 'active' || w.status === 'running').length;
    const totalExecutions = workflows.reduce((sum, w) => sum + w.executions, 0);
    const averageSuccessRate = workflows.length > 0
        ? workflows.reduce((sum, w) => sum + w.success_rate, 0) / workflows.length
        : 0;

    return (
        <Card className="bg-black border-zinc-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-400" />
                        <CardTitle className="text-white">Automation Status</CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => window.open(N8N_URL, '_blank')}
                            size="sm"
                            variant="outline"
                            className="border-zinc-700 text-white hover:bg-zinc-800"
                        >
                            <Settings className="h-4 w-4 mr-1" />
                            n8n
                        </Button>
                        <Button
                            onClick={refreshWorkflows}
                            disabled={loading}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {loading ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            Refresh
                        </Button>
                    </div>
                </div>
                <CardDescription className="text-zinc-400">
                    {activeWorkflows} active workflows • {totalExecutions} total executions • {averageSuccessRate.toFixed(1)}% success rate
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="p-3 bg-red-600/20 border border-red-600/30 rounded-lg mb-4">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {workflows.length === 0 ? (
                    <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-400">No automation workflows found</p>
                        <p className="text-sm text-zinc-500 mt-1">
                            Set up workflows in n8n to automate your daily tasks
                        </p>
                        <Button
                            onClick={() => window.open(N8N_URL, '_blank')}
                            className="mt-4 bg-purple-600 hover:bg-purple-700"
                        >
                            Open n8n Dashboard
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {workflows.map((workflow) => (
                            <div
                                key={workflow.id}
                                className="p-4 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-600 transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-medium text-white">{workflow.name}</h4>
                                            <Badge className={getStatusColor(workflow.status)}>
                                                {getStatusIcon(workflow.status)}
                                                <span className="ml-1 capitalize">{workflow.status}</span>
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-zinc-500">Last Run</p>
                                                <p className="text-zinc-300">{formatTimestamp(workflow.lastRun)}</p>
                                            </div>

                                            {workflow.nextRun && (
                                                <div>
                                                    <p className="text-zinc-500">Next Run</p>
                                                    <p className="text-zinc-300">{formatNextRun(workflow.nextRun)}</p>
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-zinc-500">Executions</p>
                                                <p className="text-zinc-300">{workflow.executions}</p>
                                            </div>

                                            <div>
                                                <p className="text-zinc-500">Success Rate</p>
                                                <p className={`font-medium ${workflow.success_rate >= 95 ? 'text-green-400' :
                                                        workflow.success_rate >= 80 ? 'text-yellow-400' : 'text-red-400'
                                                    }`}>
                                                    {workflow.success_rate.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ml-4">
                                        <Button
                                            onClick={() => window.open(`${N8N_URL}/workflow/${workflow.id}`, '_blank')}
                                            size="sm"
                                            variant="outline"
                                            className="border-zinc-700 text-white hover:bg-zinc-800"
                                        >
                                            <Zap className="h-3 w-3 mr-1" />
                                            View
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="pt-4 border-t border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-zinc-400">
                                    Automation powered by n8n workflows
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Last updated: {formatTimestamp(new Date().toISOString())}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
