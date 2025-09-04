'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    read: boolean;
    created_at: string;
}

interface NotificationsCardProps {
    notifications: Notification[];
    API_URL: string;
}

export default function NotificationsCard({ notifications, API_URL }: NotificationsCardProps) {
    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'error': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        }
    };

    return (
        <Card className="bg-zinc-950 border-zinc-800 h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-white">Notifications</CardTitle>
                </div>
                <CardDescription className="text-zinc-400">
                    Stay updated with important alerts and reminders
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto space-y-3">
                    {notifications.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-zinc-500 text-center">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-3 rounded-lg border transition-colors ${getNotificationColor(notification.type)} ${!notification.read ? 'opacity-100' : 'opacity-60'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm mb-1 truncate">
                                            {notification.title}
                                        </h4>
                                        <p className="text-xs opacity-80 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs opacity-60 mt-2">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="w-2 h-2 bg-current rounded-full flex-shrink-0 mt-1"></div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
