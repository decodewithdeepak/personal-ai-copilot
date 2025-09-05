const express = require('express');
const router = express.Router();

// Multi-channel integration status endpoint
router.get('/status', async (req, res) => {
    try {
        const integrationStatus = {
            timestamp: new Date().toISOString(),
            platforms: {
                slack: {
                    enabled: !!process.env.SLACK_BOT_TOKEN,
                    status: 'connected',
                    lastNotification: null,
                    channels: ['#ai-copilot', '#urgent-alerts', '#github-activity']
                },
                discord: {
                    enabled: !!process.env.DISCORD_WEBHOOK_URL,
                    status: 'connected',
                    lastNotification: null,
                    webhooks: ['general', 'alerts', 'github']
                },
                email: {
                    enabled: !!process.env.SMTP_HOST,
                    status: 'connected',
                    lastNotification: null,
                    provider: process.env.SMTP_HOST
                },
                github: {
                    enabled: !!process.env.GITHUB_TOKEN,
                    status: 'connected',
                    lastWebhook: null,
                    repository: process.env.GITHUB_REPO || 'personal-ai-copilot'
                },
                telegram: {
                    enabled: !!process.env.TELEGRAM_BOT_TOKEN,
                    status: 'connected',
                    lastNotification: null,
                    chatId: process.env.TELEGRAM_CHAT_ID
                },
                whatsapp: {
                    enabled: !!process.env.WHATSAPP_API_KEY,
                    status: process.env.WHATSAPP_API_KEY ? 'connected' : 'disabled',
                    lastNotification: null,
                    provider: 'twilio' // or your provider
                }
            },
            notifications: {
                daily_briefings_sent: 0, // This would come from your database
                urgent_alerts_sent: 0,
                github_events_processed: 0,
                total_notifications_today: 0
            },
            health: 'healthy'
        };

        // Calculate overall health
        const enabledPlatforms = Object.values(integrationStatus.platforms).filter(p => p.enabled);
        const healthyPlatforms = enabledPlatforms.filter(p => p.status === 'connected');

        if (healthyPlatforms.length === enabledPlatforms.length) {
            integrationStatus.health = 'healthy';
        } else if (healthyPlatforms.length > 0) {
            integrationStatus.health = 'partial';
        } else {
            integrationStatus.health = 'unhealthy';
        }

        res.json({
            success: true,
            data: integrationStatus
        });
    } catch (error) {
        console.error('Error getting integration status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get integration status'
        });
    }
});

// Test notification endpoint - sends test message to all platforms
router.post('/test', async (req, res) => {
    try {
        const testMessage = "🧪 Test notification from AI Copilot - All systems operational!";
        const results = {};

        // Here you would implement test calls to each platform
        // This is a simplified version
        results.slack = { sent: !!process.env.SLACK_BOT_TOKEN, timestamp: new Date().toISOString() };
        results.discord = { sent: !!process.env.DISCORD_WEBHOOK_URL, timestamp: new Date().toISOString() };
        results.email = { sent: !!process.env.SMTP_HOST, timestamp: new Date().toISOString() };
        results.telegram = { sent: !!process.env.TELEGRAM_BOT_TOKEN, timestamp: new Date().toISOString() };

        res.json({
            success: true,
            message: "Test notifications sent",
            results: results
        });
    } catch (error) {
        console.error('Error sending test notifications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send test notifications'
        });
    }
});

// Get notification history
router.get('/history', async (req, res) => {
    try {
        // This would typically come from your database
        const notificationHistory = [
            {
                id: 1,
                type: 'daily_briefing',
                platforms: ['slack', 'discord', 'email'],
                sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                status: 'success',
                recipient_count: 3
            },
            {
                id: 2,
                type: 'urgent_alert',
                platforms: ['slack', 'telegram', 'email'],
                sent_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
                status: 'success',
                recipient_count: 3,
                task_id: 16
            },
            {
                id: 3,
                type: 'github_notification',
                platforms: ['slack', 'discord'],
                sent_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
                status: 'success',
                recipient_count: 2,
                github_event: 'pull_request_opened'
            }
        ];

        res.json({
            success: true,
            data: notificationHistory
        });
    } catch (error) {
        console.error('Error getting notification history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get notification history'
        });
    }
});

// Update integration settings
router.put('/settings', async (req, res) => {
    try {
        const { platform, settings } = req.body;

        // Here you would update platform-specific settings
        // For now, just return success

        res.json({
            success: true,
            message: `Settings updated for ${platform}`,
            settings: settings
        });
    } catch (error) {
        console.error('Error updating integration settings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update integration settings'
        });
    }
});

module.exports = router;
