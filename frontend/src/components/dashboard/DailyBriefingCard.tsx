'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock } from 'lucide-react';

interface DailyBriefingCardProps {
    briefing: string;
    onGenerateBriefing: () => void;
    API_URL: string;
}

export default function DailyBriefingCard({ briefing, onGenerateBriefing, API_URL }: DailyBriefingCardProps) {
    const [loading, setLoading] = useState(false);

    const generateBriefing = async () => {
        setLoading(true);
        try {
            await onGenerateBriefing();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-zinc-950 border-zinc-800 h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        <CardTitle className="text-white">Daily Briefing</CardTitle>
                    </div>
                    <Button
                        onClick={generateBriefing}
                        disabled={loading}
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700"
                    >
                        {loading ? (
                            <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <CardDescription className="text-zinc-400">
                    Your AI-generated daily summary and insights
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <div className="h-full">
                    {briefing ? (
                        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 h-full overflow-y-auto">
                            <div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                                {briefing}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 h-full flex items-center justify-center">
                            <div className="text-center">
                                <Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-4 opacity-50" />
                                <p className="text-zinc-500 mb-4">No briefing generated yet</p>
                                <Button
                                    onClick={generateBriefing}
                                    disabled={loading}
                                    className="bg-yellow-600 hover:bg-yellow-700"
                                >
                                    {loading ? (
                                        <>
                                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Generate Daily Briefing
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
