const pool = require('../database/connection');

class NotificationService {
    constructor(io) {
        this.io = io;
    }

    // Create and emit a notification
    async createNotification(userId, title, message, type = 'info') {
        try {
            const result = await pool.query(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [userId, title, message, type]);

            const notification = result.rows[0];

            // Emit real-time notification
            this.io.emit('notification', {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                timestamp: notification.created_at
            });

            return notification;
        } catch (error) {
            console.error('❌ Create notification error:', error);
            throw error;
        }
    }

    // Task-related notifications
    async checkTaskDeadlines(userId = 1) {
        try {
            const result = await pool.query(`
        SELECT * FROM tasks 
        WHERE user_id = $1 
        AND status != 'completed' 
        AND due_date::date = CURRENT_DATE + INTERVAL '1 day'
      `, [userId]);

            for (const task of result.rows) {
                await this.createNotification(
                    userId,
                    '📅 Task Due Tomorrow',
                    `"${task.title}" is due tomorrow. Priority: ${task.priority.toUpperCase()}`,
                    'warning'
                );
            }

            // Check overdue tasks
            const overdueResult = await pool.query(`
        SELECT * FROM tasks 
        WHERE user_id = $1 
        AND status != 'completed' 
        AND due_date::date < CURRENT_DATE
      `, [userId]);

            for (const task of overdueResult.rows) {
                await this.createNotification(
                    userId,
                    '⚠️ Overdue Task',
                    `"${task.title}" is overdue! Please update or complete.`,
                    'error'
                );
            }

            return { upcoming: result.rows.length, overdue: overdueResult.rows.length };
        } catch (error) {
            console.error('❌ Task deadline check error:', error);
            return { upcoming: 0, overdue: 0 };
        }
    }

    // High priority task reminder
    async checkHighPriorityTasks(userId = 1) {
        try {
            const result = await pool.query(`
        SELECT COUNT(*) as high_priority_count 
        FROM tasks 
        WHERE user_id = $1 
        AND status != 'completed' 
        AND priority = 'high'
      `, [userId]);

            const count = parseInt(result.rows[0].high_priority_count);

            if (count >= 3) {
                await this.createNotification(
                    userId,
                    '🎯 Focus Alert',
                    `You have ${count} high-priority tasks. Consider tackling the most urgent one first!`,
                    'warning'
                );
            }

            return count;
        } catch (error) {
            console.error('❌ High priority check error:', error);
            return 0;
        }
    }

    // Productivity insights
    async generateProductivityInsights(userId = 1) {
        try {
            const completedToday = await pool.query(`
        SELECT COUNT(*) as completed_today 
        FROM tasks 
        WHERE user_id = $1 
        AND status = 'completed' 
        AND DATE(updated_at) = CURRENT_DATE
      `, [userId]);

            const count = parseInt(completedToday.rows[0].completed_today);

            if (count >= 3) {
                await this.createNotification(
                    userId,
                    '🎉 Great Progress!',
                    `Awesome! You've completed ${count} tasks today. Keep up the momentum!`,
                    'success'
                );
            } else if (count === 0) {
                await this.createNotification(
                    userId,
                    '💪 Let\'s Get Started',
                    'Ready to tackle your tasks? Start with a quick win to build momentum!',
                    'info'
                );
            }

            return count;
        } catch (error) {
            console.error('❌ Productivity insights error:', error);
            return 0;
        }
    }

    // Weather-based notifications
    async createWeatherNotification(userId = 1, weatherData) {
        try {
            if (!weatherData || !weatherData.available) return;

            const temp = weatherData.temperature;
            const condition = weatherData.condition?.toLowerCase() || '';

            let message = '';
            let type = 'info';

            if (temp > 35) {
                message = `🌡️ Very hot day (${temp}°C)! Stay hydrated and consider indoor tasks during peak hours.`;
                type = 'warning';
            } else if (temp < 10) {
                message = `🥶 Cold day (${temp}°C)! Perfect weather for focused indoor work.`;
                type = 'info';
            } else if (condition.includes('rain')) {
                message = `🌧️ Rainy weather today! Great time for indoor productivity and cozy work sessions.`;
                type = 'info';
            } else if (condition.includes('clear') || condition.includes('sunny')) {
                message = `☀️ Beautiful clear weather (${temp}°C)! Consider outdoor meetings or a refreshing break.`;
                type = 'success';
            }

            if (message) {
                await this.createNotification(userId, '🌤️ Weather Update', message, type);
            }
        } catch (error) {
            console.error('❌ Weather notification error:', error);
        }
    }

    // News-based notifications
    async createNewsNotification(userId = 1, newsData) {
        try {
            if (!newsData || !newsData.available || !newsData.headlines?.length) return;

            const techHeadlines = newsData.headlines.filter(article =>
                article.title.toLowerCase().includes('tech') ||
                article.title.toLowerCase().includes('ai') ||
                article.title.toLowerCase().includes('innovation')
            );

            if (techHeadlines.length > 0) {
                const headline = techHeadlines[0];
                await this.createNotification(
                    userId,
                    '📰 Tech News Alert',
                    `${headline.title} - ${headline.source}`,
                    'info'
                );
            }
        } catch (error) {
            console.error('❌ News notification error:', error);
        }
    }

    // Daily briefing notification
    async notifyBriefingGenerated(userId = 1) {
        try {
            await this.createNotification(
                userId,
                '🤖 Daily Briefing Ready',
                'Your AI-powered daily briefing has been generated with personalized insights and priorities.',
                'success'
            );
        } catch (error) {
            console.error('❌ Briefing notification error:', error);
        }
    }

    // System health notifications
    async checkSystemHealth(userId = 1) {
        try {
            // Check if user has been productive recently
            const recentActivity = await pool.query(`
        SELECT COUNT(*) as recent_tasks
        FROM tasks 
        WHERE user_id = $1 
        AND updated_at > NOW() - INTERVAL '24 hours'
      `, [userId]);

            const activityCount = parseInt(recentActivity.rows[0].recent_tasks);

            if (activityCount === 0) {
                await this.createNotification(
                    userId,
                    '🔄 Activity Reminder',
                    'No task updates in the last 24 hours. Your AI Copilot is ready to help you stay organized!',
                    'info'
                );
            }

            return activityCount;
        } catch (error) {
            console.error('❌ System health check error:', error);
            return 0;
        }
    }

    // Run all smart checks
    async runSmartNotificationChecks(userId = 1, weatherData = null, newsData = null) {
        console.log('🔔 Running smart notification checks...');

        try {
            const results = await Promise.allSettled([
                this.checkTaskDeadlines(userId),
                this.checkHighPriorityTasks(userId),
                this.generateProductivityInsights(userId),
                this.checkSystemHealth(userId)
            ]);

            if (weatherData) {
                await this.createWeatherNotification(userId, weatherData);
            }

            if (newsData) {
                await this.createNewsNotification(userId, newsData);
            }

            console.log('✅ Smart notification checks completed');
            return results;
        } catch (error) {
            console.error('❌ Smart notification checks error:', error);
            return [];
        }
    }
}

module.exports = NotificationService;
