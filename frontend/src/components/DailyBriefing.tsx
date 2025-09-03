'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, Loader2 } from 'lucide-react';

interface BriefingProps {
    onRefresh?: () => void;
}

interface BriefingData {
    briefing: string;
    formatted_briefing: string;
    agent_contributions: any;
    generated_at: string;
    agent_powered: boolean;
}

export default function DailyBriefing({ onRefresh }: BriefingProps) {
    const [briefing, setBriefing] = useState<BriefingData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        loadTodaysBriefing();
    }, []);

    const loadTodaysBriefing = async () => {
        try {
            setError(null);
            const response = await fetch(`${API_URL}/api/briefing/today`);
            const data = await response.json();

            if (data.success && data.data) {
                // Parse the stored briefing content
                const content = JSON.parse(data.data.content);
                setBriefing({
                    briefing: content.briefing,
                    formatted_briefing: content.briefing,
                    agent_contributions: content.agent_contributions,
                    generated_at: data.data.generated_at,
                    agent_powered: data.data.agent_generated
                });
            }
        } catch (error) {
            console.error('Error loading briefing:', error);
            setError('Failed to load today\'s briefing');
        }
    };

    const generateNewBriefing = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/briefing/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 1,
                    includeWeather: true,
                    includeNews: true,
                    preferences: {
                        topics: ['technology', 'business', 'ai'],
                        tone: 'professional',
                        length: 'detailed'
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                setBriefing(data);
                onRefresh?.();
            } else {
                setError('Failed to generate briefing');
            }
        } catch (error) {
            console.error('Error generating briefing:', error);
            setError('Network error while generating briefing');
        } finally {
            setLoading(false);
        }
    };

    const formatBriefingText = (text: string) => {
        return text
            .split('\n')
            .map((line, index) => {
                if (line.startsWith('# ')) {
                    return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-white">{line.slice(2)}</h2>;
                }
                if (line.startsWith('## ')) {
                    return <h3 key={index} className="text-lg font-semibold mt-3 mb-2 text-zinc-200">{line.slice(3)}</h3>;
                }
                if (line.startsWith('### ')) {
                    return <h4 key={index} className="text-md font-medium mt-2 mb-1 text-zinc-300">{line.slice(4)}</h4>;
                }
                if (line.startsWith('- ')) {
                    return <li key={index} className="ml-4 text-zinc-300">{line.slice(2)}</li>;
                }
                if (line.trim() === '') {
                    return <br key={index} />;
                }
                return <p key={index} className="mb-2 text-zinc-300">{line}</p>;
            });
    };

    return (
        <Card className="bg-black border-zinc-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-400" />
                        <CardTitle className="text-white">Today's AI Briefing</CardTitle>
                        {briefing?.agent_powered && (
                            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                AI Agents
                            </span>
                        )}
                    </div>
                    <Button
                        onClick={generateNewBriefing}
                        disabled={loading}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4" />
                        )}
                        {loading ? 'Generating...' : 'Refresh'}
                    </Button>
                </div>
                {briefing?.generated_at && (
                    <CardDescription className="flex items-center gap-1 text-zinc-400">
                        <Clock className="h-3 w-3" />
                        Last updated: {new Date(briefing.generated_at).toLocaleString()}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="p-3 bg-red-600/20 border border-red-600/30 rounded-lg mb-4">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {briefing ? (
                    <div className="space-y-2">
                        <div className="prose prose-invert max-w-none">
                            {formatBriefingText(briefing.briefing)}
                        </div>

                        {briefing.agent_contributions && (
                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm text-zinc-400 hover:text-white">
                                    View Agent Contributions
                                </summary>
                                <div className="mt-2 p-3 bg-zinc-900 rounded-lg">
                                    <pre className="text-xs text-zinc-400 overflow-x-auto">
                                        {JSON.stringify(briefing.agent_contributions, null, 2)}
                                    </pre>
                                </div>
                            </details>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-zinc-400 mb-4">No briefing available for today</p>
                        <Button
                            onClick={generateNewBriefing}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Sparkles className="h-4 w-4 mr-2" />
                            )}
                            Generate Daily Briefing
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
