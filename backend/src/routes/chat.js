const express = require('express');
const router = express.Router();
const ragService = require('../services/rag');

// Chat with AI assistant
router.post('/', async (req, res) => {
    try {
        const { message, userId = 1 } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Generate AI response using RAG
        const result = await ragService.generateResponse(message, userId);

        // Emit real-time update
        req.io.emit('chat_response', {
            message,
            response: result.response,
            sources: result.sources,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            data: {
                message,
                response: result.response,
                sources: result.sources,
                context_used: result.context.length
            }
        });
    } catch (error) {
        console.error('❌ Chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process chat message'
        });
    }
});

// Get chat history
router.get('/history', async (req, res) => {
    try {
        const { userId = 1, limit = 10 } = req.query;
        const pool = require('../database/connection');

        const result = await pool.query(`
      SELECT message, response, context, created_at
      FROM conversations 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `, [userId, limit]);

        res.json({
            success: true,
            data: result.rows.reverse() // Reverse to show oldest first
        });
    } catch (error) {
        console.error('❌ Chat history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chat history'
        });
    }
});

module.exports = router;
