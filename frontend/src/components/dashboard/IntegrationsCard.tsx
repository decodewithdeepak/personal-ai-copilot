import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Platform {
    enabled: boolean;
    status: 'connected' | 'error' | 'disabled';
    lastNotification?: string | null;
    channels?: string[];
    webhooks?: string[];
    provider?: string;
    chatId?: string;
    repository?: string;
    lastWebhook?: string | null;
}

interface Notifications {
    daily_briefings_sent: number;
    urgent_alerts_sent: number;
    github_events_processed: number;
    total_notifications_today: number;
}

interface IntegrationData {
    timestamp: string;
    platforms: {
        slack: Platform;
        discord: Platform;
        email: Platform;
        github: Platform;
        telegram: Platform;
        whatsapp: Platform;
    };
    notifications: Notifications;
    health: 'healthy' | 'partial' | 'unhealthy';
}

interface IntegrationsCardProps {
    API_URL: string;
}

const IntegrationsCard = ({ API_URL }: IntegrationsCardProps) => {
    const [integrations, setIntegrations] = useState<IntegrationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        fetchIntegrationStatus();
    }, []);

    const fetchIntegrationStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/api/integrations/status`);
            const data = await response.json();
            if (data.success) {
                setIntegrations(data.data);
            }
        } catch (error) {
            console.error('Error fetching integration status:', error);
        } finally {
            setLoading(false);
        }
    };

    const testNotifications = async () => {
        setTesting(true);
        try {
            const response = await fetch(`${API_URL}/api/integrations/test`, { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                alert('Test notifications sent successfully!');
            }
        } catch (error) {
            console.error('Error sending test notifications:', error);
            alert('Failed to send test notifications');
        } finally {
            setTesting(false);
        }
    };

    const getStatusBadge = (platform: Platform) => {
        if (!platform.enabled) {
            return <Badge variant="outline">Disabled</Badge>;
        }

        switch (platform.status) {
            case 'connected':
                return <Badge className="bg-green-500">Connected</Badge>;
            case 'error':
                return <Badge variant="destructive">Error</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    const getPlatformIcon = (platformName: string) => {
        const icons: Record<string, string> = {
            slack: '💬',
            discord: '🎮',
            email: '📧',
            github: '🐙',
            telegram: '✈️',
            whatsapp: '📱'
        };
        return icons[platformName] || '🔗';
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>🔗 Platform Integrations</CardTitle>
                    <CardDescription>Loading integration status...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>🔗 Platform Integrations</span>
                    <Badge
                        className={
                            integrations?.health === 'healthy' ? 'bg-green-500' :
                                integrations?.health === 'partial' ? 'bg-yellow-500' :
                                    'bg-red-500'
                        }
                    >
                        {integrations?.health || 'Unknown'}
                    </Badge>
                </CardTitle>
                <CardDescription>
                    Multi-channel notification status and connectivity
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Platform Status Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {integrations?.platforms && Object.entries(integrations.platforms).map(([name, platform]) => (
                        <div key={name} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-2">
                                <span className="text-lg">{getPlatformIcon(name)}</span>
                                <div>
                                    <div className="font-medium capitalize">{name}</div>
                                    {platform.channels && (
                                        <div className="text-xs text-muted-foreground">
                                            {platform.channels.length} channels
                                        </div>
                                    )}
                                </div>
                            </div>
                            {getStatusBadge(platform)}
                        </div>
                    ))}
                </div>

                {/* Notification Statistics */}
                {integrations?.notifications && (
                    <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">📊 Today's Notifications</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-muted-foreground">Daily Briefings</div>
                                <div className="font-medium">{integrations.notifications.daily_briefings_sent}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Urgent Alerts</div>
                                <div className="font-medium">{integrations.notifications.urgent_alerts_sent}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">GitHub Events</div>
                                <div className="font-medium">{integrations.notifications.github_events_processed}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Total Sent</div>
                                <div className="font-medium">{integrations.notifications.total_notifications_today}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="flex space-x-2">
                    <Button
                        onClick={testNotifications}
                        disabled={testing}
                        size="sm"
                        variant="outline"
                    >
                        {testing ? 'Testing...' : '🧪 Test All Notifications'}
                    </Button>
                    <Button
                        onClick={fetchIntegrationStatus}
                        size="sm"
                        variant="outline"
                    >
                        🔄 Refresh Status
                    </Button>
                </div>

                {/* Recent Activity */}
                <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">📝 Recent Activity</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Last daily briefing</span>
                            <span className="text-muted-foreground">2 hours ago</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Last urgent alert</span>
                            <span className="text-muted-foreground">30 minutes ago</span>
                        </div>
                        <div className="flex justify-between">
                            <span>GitHub webhook</span>
                            <span className="text-muted-foreground">15 minutes ago</span>
                        </div>
                    </div>
                </div>

                {/* Configuration Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm">
                        <div className="font-medium text-blue-900 mb-1">💡 Integration Tips</div>
                        <div className="text-blue-700">
                            • Set up webhooks for real-time GitHub notifications<br />
                            • Configure time zones for optimal notification scheduling<br />
                            • Use different channels for different priority levels
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default IntegrationsCard;
