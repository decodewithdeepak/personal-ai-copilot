import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, RefreshCw, ExternalLink, Clock } from 'lucide-react';

interface NewsArticle {
    title: string;
    description: string;
    source: string;
    published: string;
    url?: string;
}

interface NewsData {
    available: boolean;
    headlines?: NewsArticle[];
    summary?: string;
    error?: string;
}

interface NewsCardProps {
    API_URL: string;
}

export function NewsCard({ API_URL }: NewsCardProps) {
    const [news, setNews] = useState<NewsData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/news/headlines`);
            const data = await response.json();
            if (data.success) {
                setNews(data.news);
            } else {
                setNews({ available: false, error: 'Failed to fetch news' });
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            setNews({ available: false, error: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (publishedAt: string) => {
        const now = new Date();
        const published = new Date(publishedAt);
        const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <Card className="bg-zinc-950 border border-zinc-800 h-[300px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
                <CardTitle className="text-white flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-blue-400" />
                    Latest News
                </CardTitle>
                <Button
                    onClick={fetchNews}
                    disabled={loading}
                    size="sm"
                    variant="ghost"
                    className="text-zinc-400 hover:text-white"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                ) : news?.available && news.headlines?.length ? (
                    <div className="space-y-3 h-full overflow-y-auto">
                        {news.headlines.slice(0, 3).map((article, index) => (
                            <div key={index} className="border-b border-zinc-800 pb-3 last:border-b-0">
                                <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">
                                    {article.title}
                                </h3>
                                <p className="text-xs text-zinc-400 line-clamp-2 mb-2">
                                    {article.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-zinc-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatTimeAgo(article.published)}
                                    </span>
                                    <span className="font-medium">{article.source}</span>
                                </div>
                            </div>
                        ))}

                        {news.headlines.length > 3 && (
                            <div className="text-center pt-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-zinc-400 hover:text-white text-xs"
                                >
                                    View all {news.headlines.length} articles
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Newspaper className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">
                            {news?.error || 'No news available'}
                        </p>
                        <Button
                            onClick={fetchNews}
                            size="sm"
                            className="mt-3 bg-zinc-800 hover:bg-zinc-700 text-white"
                        >
                            Retry
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
