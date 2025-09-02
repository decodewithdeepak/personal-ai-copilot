const express = require('express');
const router = express.Router();
const pool = require('../database/connection');
const geminiService = require('../services/gemini');

// Generate daily briefing
router.post('/generate', async (req, res) => {
    try {
        const { userId = 1 } = req.body;

        // Get today's tasks
        const tasksResult = await pool.query(`
      SELECT title, description, priority, due_date, status
      FROM tasks 
      WHERE user_id = $1 
      AND (due_date >= CURRENT_DATE OR due_date IS NULL)
      AND status != 'completed'
      ORDER BY priority DESC, due_date ASC
    `, [userId]);

        // Mock weather data (in real app, call weather API)
        const weather = "Sunny, 72°F. Perfect weather for outdoor activities.";

        // Mock news data (in real app, call news API)
        const news = "Tech: AI development continues to accelerate. Markets: Steady growth in tech sector.";

        // Generate briefing using Gemini
        const briefingContent = await geminiService.generateDailyBriefing(
            tasksResult.rows,
            weather,
            news
        );

        // Save briefing to database
        const today = new Date().toISOString().split('T')[0];
        await pool.query(`
      INSERT INTO briefings (user_id, content, briefing_date)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, briefing_date) 
      DO UPDATE SET content = $2, created_at = CURRENT_TIMESTAMP
    `, [userId, JSON.stringify({
            briefing: briefingContent,
            tasks: tasksResult.rows,
            weather,
            news,
            generated_at: new Date().toISOString()
        }), today]);

        // Emit real-time update
        req.io.emit('briefing_generated', {
            briefing: briefingContent,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            data: {
                briefing: briefingContent,
                tasks_count: tasksResult.rows.length,
                weather,
                news
            }
        });
    } catch (error) {
        console.error('❌ Briefing generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate daily briefing'
        });
    }
});

// Get today's briefing
router.get('/today', async (req, res) => {
    try {
        const { userId = 1 } = req.query;
        const today = new Date().toISOString().split('T')[0];

        const result = await pool.query(`
      SELECT content, created_at
      FROM briefings 
      WHERE user_id = $1 AND briefing_date = $2
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId, today]);

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: 'No briefing found for today. Generate one first.'
            });
        }

        res.json({
            success: true,
            data: result.rows[0].content
        });
    } catch (error) {
        console.error('❌ Get briefing error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch today\'s briefing'
        });
    }
});

// Get briefing history
router.get('/history', async (req, res) => {
    try {
        const { userId = 1, limit = 7 } = req.query;

        const result = await pool.query(`
      SELECT content, briefing_date, created_at
      FROM briefings 
      WHERE user_id = $1 
      ORDER BY briefing_date DESC 
      LIMIT $2
    `, [userId, limit]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('❌ Briefing history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch briefing history'
        });
    }
});

module.exports = router;
