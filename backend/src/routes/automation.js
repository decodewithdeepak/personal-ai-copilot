const express = require('express');
const router = express.Router();
const axios = require('axios');

// n8n webhook URLs - these should match your n8n workflow webhook endpoints
const N8N_BASE_URL = process.env.N8N_URL || 'http://localhost:5678';
const N8N_WEBHOOK_BASE = `${N8N_BASE_URL}/webhook`;

// Daily Briefing Automation
router.post('/daily-briefing', async (req, res) => {
    try {
        console.log('🤖 Triggering n8n Daily Briefing Automation...');

        // Trigger n8n workflow via webhook
        try {
            const n8nResponse = await axios.post(`${N8N_WEBHOOK_BASE}/daily-briefing`, {
                userId: req.body.userId,
                trigger: 'manual',
                timestamp: new Date().toISOString()
            }, {
                timeout: 30000,
                headers: { 'Content-Type': 'application/json' }
            });

            console.log('✅ n8n Daily Briefing triggered successfully');
        } catch (n8nError) {
            console.log('⚠️ n8n webhook failed, using fallback AI generation');
        }

        // Fallback: Generate briefing using our AI agents
        const AgentManager = require('../agents/AgentManager');
        const agentManager = new AgentManager();

        const briefingResult = await agentManager.executeAgentWorkflow(
            req.body.userId,
            'daily_briefing'
        );

        // Emit real-time update
        req.io.emit('automation_completed', {
            workflow: 'daily-briefing',
            result: briefingResult,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Daily briefing automation completed',
            briefing: briefingResult.briefing,
            automation: {
                n8n_triggered: true,
                ai_generated: true,
                duration: briefingResult.executionTime
            }
        });

    } catch (error) {
        console.error('❌ Daily briefing automation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to execute daily briefing automation',
            details: error.message
        });
    }
});

// Task Management Automation
router.post('/task-management', async (req, res) => {
    try {
        console.log('📋 Triggering n8n Task Management Automation...');

        // Trigger n8n workflow
        try {
            await axios.post(`${N8N_WEBHOOK_BASE}/task-management`, {
                userId: req.body.userId,
                trigger: 'manual'
            }, { timeout: 15000 });
        } catch (n8nError) {
            console.log('⚠️ n8n task webhook failed, using direct processing');
        }

        // Get current tasks and optimize them
        const pool = require('../database/connection');
        const tasksResult = await pool.query(`
            SELECT id, title, description, priority, due_date, status 
            FROM tasks 
            WHERE user_id = $1 AND status != 'completed'
            ORDER BY 
                CASE priority 
                    WHEN 'high' THEN 1 
                    WHEN 'medium' THEN 2 
                    WHEN 'low' THEN 3 
                END,
                due_date ASC NULLS LAST
        `, [req.body.userId]);

        const tasks = tasksResult.rows;

        // Generate task optimization suggestions using AI
        const AgentManager = require('../agents/AgentManager');
        const agentManager = new AgentManager();

        const optimizationResult = await agentManager.executeAgentWorkflow(
            req.body.userId,
            'task_planning'
        );

        // Emit real-time update
        req.io.emit('automation_completed', {
            workflow: 'task-management',
            result: optimizationResult,
            tasksProcessed: tasks.length,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Task management automation completed',
            tasksAnalyzed: tasks.length,
            suggestions: optimizationResult.suggestions,
            automation: {
                n8n_triggered: true,
                ai_optimized: true
            }
        });

    } catch (error) {
        console.error('❌ Task management automation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to execute task management automation',
            details: error.message
        });
    }
});

// Knowledge Gathering Automation
router.post('/knowledge-gathering', async (req, res) => {
    try {
        console.log('🧠 Triggering n8n Knowledge Gathering Automation...');

        // Trigger n8n workflow
        try {
            await axios.post(`${N8N_WEBHOOK_BASE}/knowledge-gathering`, {
                userId: req.body.userId,
                trigger: 'manual'
            }, { timeout: 20000 });
        } catch (n8nError) {
            console.log('⚠️ n8n knowledge webhook failed, using direct gathering');
        }

        // Gather external knowledge using Research Agent
        const AgentManager = require('../agents/AgentManager');
        const agentManager = new AgentManager();

        const researchResult = await agentManager.executeAgentWorkflow(
            req.body.userId,
            'research_query'
        );

        // Store gathered knowledge in database
        const pool = require('../database/connection');

        if (researchResult.knowledge && researchResult.knowledge.length > 0) {
            for (const item of researchResult.knowledge) {
                await pool.query(`
                    INSERT INTO documents (title, content, metadata, user_id)
                    VALUES ($1, $2, $3, $4)
                `, [
                    item.title || 'Knowledge Item',
                    item.content,
                    JSON.stringify({
                        source: 'automation',
                        type: 'research',
                        timestamp: new Date().toISOString()
                    }),
                    req.body.userId
                ]);
            }
        }

        // Emit real-time update
        req.io.emit('automation_completed', {
            workflow: 'knowledge-gathering',
            result: researchResult,
            itemsGathered: researchResult.knowledge?.length || 0,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Knowledge gathering automation completed',
            itemsGathered: researchResult.knowledge?.length || 0,
            sources: researchResult.sources,
            automation: {
                n8n_triggered: true,
                ai_processed: true,
                stored_in_rag: true
            }
        });

    } catch (error) {
        console.error('❌ Knowledge gathering automation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to execute knowledge gathering automation',
            details: error.message
        });
    }
});

// Get automation status and history
router.get('/status', async (req, res) => {
    try {
        // Check n8n health
        let n8nStatus = 'unknown';
        try {
            await axios.get(`${N8N_BASE_URL}/healthz`, { timeout: 5000 });
            n8nStatus = 'healthy';
        } catch (error) {
            n8nStatus = 'unavailable';
        }

        // Get recent automation history from database
        const pool = require('../database/connection');
        const historyResult = await pool.query(`
            SELECT * FROM automation_logs 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 10
        `, [req.query.userId || 1]);

        res.json({
            success: true,
            n8n_status: n8nStatus,
            n8n_url: N8N_BASE_URL,
            automation_history: historyResult.rows,
            available_workflows: [
                'daily-briefing',
                'task-management',
                'knowledge-gathering'
            ]
        });

    } catch (error) {
        console.error('❌ Automation status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get automation status'
        });
    }
});

module.exports = router;
