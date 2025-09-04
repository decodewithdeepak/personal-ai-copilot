const express = require('express');
const router = express.Router();
const pool = require('../database/connection');
const NotificationService = require('../services/NotificationService');

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const { userId = 1, status, priority } = req.query;

        let query = `
      SELECT id, title, description, status, priority, due_date, created_at, updated_at
      FROM tasks 
      WHERE user_id = $1
    `;
        const params = [userId];
        let paramIndex = 2;

        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (priority) {
            query += ` AND priority = $${paramIndex}`;
            params.push(priority);
            paramIndex++;
        }

        query += ` ORDER BY 
      CASE priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
      END,
      due_date ASC NULLS LAST,
      created_at DESC
    `;

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('❌ Get tasks error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tasks'
        });
    }
});

// Create new task
router.post('/', async (req, res) => {
    try {
        const {
            title,
            description,
            priority = 'medium',
            due_date,
            userId = 1
        } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        const result = await pool.query(`
      INSERT INTO tasks (user_id, title, description, priority, due_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, title, description, priority, due_date]);

        const newTask = result.rows[0];

        // Emit real-time update
        req.io.emit('task_created', {
            task: newTask,
            timestamp: new Date().toISOString()
        });

        // Generate smart notification for new task
        try {
            const notificationService = new NotificationService(req.io);
            if (priority === 'high') {
                await notificationService.createNotification(
                    userId,
                    '🎯 High Priority Task Added',
                    `New high-priority task created: "${title}". Consider tackling this soon!`,
                    'warning'
                );
            }
        } catch (notificationError) {
            console.error('❌ Task notification error:', notificationError);
        }

        res.status(201).json({
            success: true,
            data: newTask
        });
    } catch (error) {
        console.error('❌ Create task error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create task'
        });
    }
});

// Update task
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, due_date } = req.body;

        const result = await pool.query(`
      UPDATE tasks 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        due_date = COALESCE($5, due_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [title, description, status, priority, due_date, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        const updatedTask = result.rows[0];

        // Emit real-time update
        req.io.emit('task_updated', {
            task: updatedTask,
            timestamp: new Date().toISOString()
        });

        // Generate completion notification
        try {
            if (status === 'completed') {
                const notificationService = new NotificationService(req.io);
                await notificationService.createNotification(
                    updatedTask.user_id,
                    '✅ Task Completed!',
                    `Great job completing "${updatedTask.title}"! Keep up the momentum!`,
                    'success'
                );
            }
        } catch (notificationError) {
            console.error('❌ Task completion notification error:', notificationError);
        }

        res.json({
            success: true,
            data: updatedTask
        });
    } catch (error) {
        console.error('❌ Update task error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update task'
        });
    }
});

// Delete task
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      DELETE FROM tasks 
      WHERE id = $1
      RETURNING *
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        // Emit real-time update
        req.io.emit('task_deleted', {
            taskId: id,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete task error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete task'
        });
    }
});

// Get task statistics
router.get('/stats', async (req, res) => {
    try {
        const { userId = 1 } = req.query;

        const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 END) as overdue
      FROM tasks 
      WHERE user_id = $1
    `, [userId]);

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Task stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch task statistics'
        });
    }
});

module.exports = router;
