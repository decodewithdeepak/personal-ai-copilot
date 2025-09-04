'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Play, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface AutomationCardProps {
    API_URL: string;
    onAutomationComplete?: (workflowName: string, result: any) => void;
}

export default function AutomationCard({ API_URL, onAutomationComplete }: AutomationCardProps) {
    const [automationStatus, setAutomationStatus] = useState<{ [key: string]: 'idle' | 'running' | 'success' | 'error' }>({
        'daily-briefing': 'idle',
        'task-management': 'idle',
        'knowledge-gathering': 'idle'
    });

    const [lastResults, setLastResults] = useState<{ [key: string]: any }>({});

    const workflows = [
        {
            id: 'daily-briefing',
            name: 'Daily Briefing Automation',
            description: 'Generate AI briefing with weather & news',
            icon: <Clock className="h-5 w-5" />,
            endpoint: '/api/automation/daily-briefing'
        },
        {
            id: 'task-management',
            name: 'Smart Task Management',
            description: 'Optimize and prioritize your tasks',
            icon: <CheckCircle className="h-5 w-5" />,
            endpoint: '/api/automation/task-management'
        },
        {
            id: 'knowledge-gathering',
            name: 'Knowledge Gathering',
            description: 'Collect and process external data',
            icon: <RefreshCw className="h-5 w-5" />,
            endpoint: '/api/automation/knowledge-gathering'
        }
    ];

    const triggerAutomation = async (workflow: typeof workflows[0]) => {
        setAutomationStatus(prev => ({ ...prev, [workflow.id]: 'running' }));

        try {
            const response = await fetch(`${API_URL}${workflow.endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 1,
                    trigger: 'manual',
                    timestamp: new Date().toISOString()
                })
            });

            const data = await response.json();

            if (data.success) {
                setAutomationStatus(prev => ({ ...prev, [workflow.id]: 'success' }));
                setLastResults(prev => ({ ...prev, [workflow.id]: data }));

                if (onAutomationComplete) {
                    onAutomationComplete(workflow.name, data);
                }

                // Reset status after 3 seconds
                setTimeout(() => {
                    setAutomationStatus(prev => ({ ...prev, [workflow.id]: 'idle' }));
                }, 3000);
            } else {
                throw new Error(data.error || 'Automation failed');
            }
        } catch (error) {
            console.error(`Automation ${workflow.name} failed:`, error);
            setAutomationStatus(prev => ({ ...prev, [workflow.id]: 'error' }));

            // Reset status after 3 seconds
            setTimeout(() => {
                setAutomationStatus(prev => ({ ...prev, [workflow.id]: 'idle' }));
            }, 3000);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running':
                return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Play className="h-4 w-4 text-zinc-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running':
                return 'bg-blue-600 hover:bg-blue-700 cursor-not-allowed';
            case 'success':
                return 'bg-green-600 hover:bg-green-700';
            case 'error':
                return 'bg-red-600 hover:bg-red-700';
            default:
                return 'bg-zinc-700 hover:bg-zinc-600';
        }
    };

    return (
        <Card className="bg-zinc-950 border-zinc-800 h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <CardTitle className="text-white">n8n Automation</CardTitle>
                </div>
                <CardDescription className="text-zinc-400">
                    Trigger and monitor automation workflows
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
                {workflows.map((workflow) => (
                    <div
                        key={workflow.id}
                        className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="text-blue-400">
                                    {workflow.icon}
                                </div>
                                <div>
                                    <h3 className="font-medium text-white text-sm">
                                        {workflow.name}
                                    </h3>
                                    <p className="text-xs text-zinc-400">
                                        {workflow.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(automationStatus[workflow.id])}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-xs text-zinc-500">
                                {automationStatus[workflow.id] === 'running' && 'Running...'}
                                {automationStatus[workflow.id] === 'success' && 'Completed successfully'}
                                {automationStatus[workflow.id] === 'error' && 'Failed to execute'}
                                {automationStatus[workflow.id] === 'idle' && 'Ready to run'}
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => triggerAutomation(workflow)}
                                disabled={automationStatus[workflow.id] === 'running'}
                                className={`h-8 px-3 text-xs ${getStatusColor(automationStatus[workflow.id])}`}
                            >
                                {automationStatus[workflow.id] === 'running' ? (
                                    <>
                                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                        Running
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-3 w-3 mr-1" />
                                        Trigger
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Show last result summary */}
                        {lastResults[workflow.id] && automationStatus[workflow.id] === 'success' && (
                            <div className="mt-3 p-2 bg-green-900/20 border border-green-800 rounded text-xs">
                                <div className="text-green-400 font-medium">Last execution:</div>
                                <div className="text-zinc-300">
                                    {lastResults[workflow.id].message || 'Automation completed successfully'}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Quick Actions */}
                <div className="border-t border-zinc-800 pt-4">
                    <h4 className="text-sm font-medium text-white mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full justify-start text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            onClick={() => window.open('http://localhost:5678', '_blank')}
                        >
                            <Zap className="h-3 w-3 mr-2" />
                            Open n8n Dashboard
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full justify-start text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            onClick={() => {
                                workflows.forEach(workflow => {
                                    setTimeout(() => triggerAutomation(workflow), Math.random() * 1000);
                                });
                            }}
                        >
                            <RefreshCw className="h-3 w-3 mr-2" />
                            Run All Workflows
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
