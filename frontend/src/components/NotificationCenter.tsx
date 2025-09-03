'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, CheckCircle, AlertTriangle, Info, XCircle, Eye } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    read: boolean;
    created_at: string;
    source?: string;
}

interface NotificationCenterProps {
    socket: Socket | null;
}

export default function NotificationCenter({ socket }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        loadNotifications();

        // Socket listeners for real-time notifications
        if (socket) {
            socket.on('notification', (data) => {
                setNotifications(prev => [data, ...prev]);
            });

            socket.on('notification_read', (data) => {
                setNotifications(prev => prev.map(notif =>
                    notif.id === data.notificationId
                        ? { ...notif, read: true }
                        : notif
                ));
            });

            socket.on('notification_deleted', (data) => {
                setNotifications(prev => prev.filter(notif => notif.id !== data.notificationId));
            });
        }

        return () => {
            if (socket) {
                socket.off('notification');
                socket.off('notification_read');
                socket.off('notification_deleted');
            }
        };
    }, [socket]);

    const loadNotifications = async () => {
        try {
            const response = await fetch(`${API_URL}/api/notifications?limit=20`);
            const data = await response.json();
            if (data.success) {
                setNotifications(data.data || []);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const markAsRead = async (notificationId: number) => {
        try {
            const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
                method: 'PUT'
            });

            if (response.ok) {
                // Will be updated via socket event
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const deleteNotification = async (notificationId: number) => {
        try {
            const response = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Will be updated via socket event
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        try {
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);

            await Promise.all(unreadIds.map(id =>
                fetch(`${API_URL}/api/notifications/${id}/read`, { method: 'PUT' })
            ));

            setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
            case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
            default: return <Info className="h-4 w-4 text-blue-400" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'success': return 'border-l-green-500 bg-green-600/10';
            case 'warning': return 'border-l-yellow-500 bg-yellow-600/10';
            case 'error': return 'border-l-red-500 bg-red-600/10';
            default: return 'border-l-blue-500 bg-blue-600/10';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInHours * 60);
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Card className="bg-black border-zinc-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-orange-400" />
                        <CardTitle className="text-white">Notifications</CardTitle>
                        {unreadCount > 0 && (
                            <Badge className="bg-orange-600 text-white">
                                {unreadCount}
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            onClick={markAllAsRead}
                            disabled={loading}
                            size="sm"
                            variant="outline"
                            className="border-zinc-700 text-white hover:bg-zinc-800"
                        >
                            {loading ? 'Marking...' : 'Mark all read'}
                        </Button>
                    )}
                </div>
                <CardDescription className="text-zinc-400">
                    Stay updated with your AI assistant's insights and alerts
                </CardDescription>
            </CardHeader>
            <CardContent>
                {notifications.length === 0 ? (
                    <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-400">No notifications yet</p>
                        <p className="text-sm text-zinc-500 mt-1">
                            You'll receive updates about tasks, schedules, and insights here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${notification.read ? 'opacity-75' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        {getNotificationIcon(notification.type)}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`font-medium text-sm ${notification.read ? 'text-zinc-400' : 'text-white'
                                                    }`}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                            <p className={`text-sm ${notification.read ? 'text-zinc-500' : 'text-zinc-300'
                                                }`}>
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-zinc-500">
                                                    {formatTimestamp(notification.created_at)}
                                                </span>
                                                {notification.source && (
                                                    <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                                                        {notification.source}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                        {!notification.read && (
                                            <Button
                                                onClick={() => markAsRead(notification.id)}
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                            >
                                                <Eye className="h-3 w-3" />
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => deleteNotification(notification.id)}
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400 hover:bg-red-900/20"
                                        >
                                            <X className="h-3 w-3" />
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
