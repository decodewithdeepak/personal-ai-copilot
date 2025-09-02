const express = require('express');
const router = express.Router();
const pool = require('../database/connection');

// Get all notifications
router.get('/', async (req, res) => {
    try {
        const { userId = 1, unread_only = false } = req.query;

        let query = `
      SELECT id, title, message, type, read, created_at
      FROM notifications 
      WHERE user_id = $1
    `;
        const params = [userId];

        if (unread_only === 'true') {
            query += ` AND read = FALSE`;
        }

        query += ` ORDER BY created_at DESC LIMIT 50`;

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('❌ Get notifications error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notifications'
        });
    }
});

// Create notification
router.post('/', async (req, res) => {
    try {
        const {
            title,
            message,
            type = 'info',
            userId = 1
        } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                error: 'Title and message are required'
            });
        }

        const result = await pool.query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [userId, title, message, type]);

        const notification = result.rows[0];

        // Emit real-time notification
        req.io.emit('notification', {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            timestamp: notification.created_at
        });

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('❌ Create notification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create notification'
        });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      UPDATE notifications 
      SET read = TRUE 
      WHERE id = $1
      RETURNING *
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Mark notification read error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read'
        });
    }
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
    try {
        const { userId = 1 } = req.body;

        await pool.query(`
      UPDATE notifications 
      SET read = TRUE 
      WHERE user_id = $1 AND read = FALSE
    `, [userId]);

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('❌ Mark all read error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark all notifications as read'
        });
    }
});

// Delete notification
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      DELETE FROM notifications 
      WHERE id = $1
      RETURNING *
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete notification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete notification'
        });
    }
});

// Get notification statistics
router.get('/stats', async (req, res) => {
    try {
        const { userId = 1 } = req.query;

        const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN read = FALSE THEN 1 END) as unread,
        COUNT(CASE WHEN type = 'info' THEN 1 END) as info,
        COUNT(CASE WHEN type = 'warning' THEN 1 END) as warning,
        COUNT(CASE WHEN type = 'error' THEN 1 END) as error,
        COUNT(CASE WHEN type = 'success' THEN 1 END) as success
      FROM notifications 
      WHERE user_id = $1
    `, [userId]);

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Notification stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notification statistics'
        });
    }
});

module.exports = router;
