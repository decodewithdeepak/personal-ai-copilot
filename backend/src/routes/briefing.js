const express = require('express');
const router = express.Router();
const pool = require('../database/connection');
const geminiService = require('../services/gemini');
const AgentManager = require('../agents/AgentManager');
const embeddingService = require('../services/embedding');
const OutputFormatter = require('../utils/OutputFormatter');

// Initialize Agent Manager
const agentManager = new AgentManager();

// Generate daily briefing using AI agents
router.post('/generate', async (req, res) => {
    try {
        const { userId = 1 } = req.body;
        console.log(`🚀 Generating AI agent briefing for user ${userId}`);

        // Use Agent Manager to generate collaborative briefing
        const agentBriefing = await agentManager.executeAgentWorkflow(userId, 'daily_briefing');

        // Store the briefing in database
        const today = new Date().toISOString().split('T')[0];
        const cleanBriefing = OutputFormatter.formatForPlainText(agentBriefing.briefing);

        const insertResult = await pool.query(`
            INSERT INTO briefings (user_id, content, briefing_date, agent_generated, generated_at)
            VALUES ($1, $2, $3, true, NOW())
            ON CONFLICT (user_id, briefing_date) 
            DO UPDATE SET 
                content = $2, 
                agent_generated = true, 
                generated_at = NOW(),
                created_at = CURRENT_TIMESTAMP
            RETURNING id, generated_at
        `, [userId, JSON.stringify({ briefing: cleanBriefing, agent_contributions: agentBriefing.agentContributions }), today]);

        res.json({
            success: true,
            briefing: cleanBriefing,
            formatted_briefing: OutputFormatter.formatForDisplay(agentBriefing.briefing),
            agent_contributions: agentBriefing.agentContributions,
            generated_at: agentBriefing.generatedAt,
            briefing_id: insertResult.rows[0].id,
            agent_powered: true
        });

    } catch (error) {
        console.error('❌ Agent briefing generation error:', error);

        // Fallback to traditional briefing if agents fail
        try {
            const fallbackBriefing = await generateFallbackBriefing(req.body.userId || 1);
            const cleanFallback = OutputFormatter.formatForPlainText(fallbackBriefing);

            res.json({
                success: true,
                briefing: cleanFallback,
                formatted_briefing: OutputFormatter.formatForDisplay(fallbackBriefing),
                fallback_mode: true,
                error: 'Agent system unavailable, using fallback'
            });
        } catch (fallbackError) {
            res.status(500).json({
                success: false,
                error: 'Failed to generate briefing',
                details: error.message
            });
        }
    }
});

// Fallback briefing generation (original method)
async function generateFallbackBriefing(userId) {
    const tasksResult = await pool.query(`
      SELECT title, description, priority, due_date, status
      FROM tasks 
      WHERE user_id = $1 
      AND (due_date >= CURRENT_DATE OR due_date IS NULL)
      AND status != 'completed'
      ORDER BY priority DESC, due_date ASC
    `, [userId]);

    const weather = "Weather data unavailable in fallback mode.";
    const news = "External news unavailable in fallback mode.";

    return await geminiService.generateDailyBriefing(
        tasksResult.rows,
        weather,
        news
    );
}

// Add agent status endpoint
router.get('/agent-status', async (req, res) => {
    try {
        const status = await agentManager.getAgentStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('❌ Agent status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get agent status'
        });
    }
});

// Generate task planning with agents
router.post('/plan-tasks', async (req, res) => {
    try {
        const { userId = 1 } = req.body;
        console.log(`📅 Generating task plan for user ${userId}`);

        const taskPlan = await agentManager.executeAgentWorkflow(userId, 'task_planning');

        res.json({
            success: true,
            data: taskPlan,
            agent_powered: true
        });
    } catch (error) {
        console.error('❌ Task planning error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate task plan'
        });
    }
});

// Research query endpoint
router.post('/research', async (req, res) => {
    try {
        const { query, userId = 1 } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter is required'
            });
        }

        console.log(`🔍 Research query: ${query}`);
        const researchResults = await agentManager.executeAgentWorkflow(userId, 'research_query');

        res.json({
            success: true,
            data: researchResults,
            agent_powered: true
        });
    } catch (error) {
        console.error('❌ Research query error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to execute research query'
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

// RAG Document Upload endpoint
router.post('/upload-document', async (req, res) => {
    try {
        const { title, content, userId = 1 } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Title and content are required'
            });
        }

        console.log(`📄 Uploading document: ${title}`);

        // Generate embedding for the document
        const embedding = await embeddingService.generateEmbedding(content);

        // Store in database (fallback to JSON if pgvector not available)
        const insertResult = await pool.query(`
            INSERT INTO documents (user_id, title, content, embedding, metadata, created_at)
            VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, NOW())
            RETURNING id, created_at
        `, [userId, title, content, JSON.stringify(embedding), JSON.stringify({ source: 'upload' })]);

        res.json({
            success: true,
            document_id: insertResult.rows[0].id,
            message: 'Document uploaded and processed for RAG',
            embedding_dimensions: embedding.length
        });

    } catch (error) {
        console.error('❌ Document upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload document',
            details: error.message
        });
    }
});

// RAG Query endpoint
router.post('/rag-query', async (req, res) => {
    try {
        const { query, userId = 1, limit = 5 } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }

        console.log(`🔍 RAG Query: ${query}`);

        // Generate embedding for the query
        const queryEmbedding = await embeddingService.generateEmbedding(query);

        // Get all documents for this user
        const documentsResult = await pool.query(`
            SELECT id, title, content, embedding, metadata
            FROM documents 
            WHERE user_id = $1
        `, [userId]);

        // Parse embeddings and find similar documents
        const documents = documentsResult.rows.map(doc => {
            let embedding;
            try {
                embedding = typeof doc.embedding === 'string' ?
                    JSON.parse(doc.embedding) : doc.embedding;
            } catch (e) {
                console.warn('Failed to parse embedding for doc', doc.id);
                embedding = [];
            }

            return {
                ...doc,
                embedding: embedding
            };
        }).filter(doc => doc.embedding.length > 0);

        const similarDocs = await embeddingService.findSimilarDocuments(
            queryEmbedding,
            documents,
            limit
        );

        res.json({
            success: true,
            query,
            similar_documents: similarDocs.map(doc => ({
                id: doc.id,
                title: doc.title,
                content: doc.content.substring(0, 200) + '...',
                similarity: doc.similarity,
                metadata: doc.metadata
            })),
            total_documents: documents.length
        });

    } catch (error) {
        console.error('❌ RAG query error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to execute RAG query',
            details: error.message
        });
    }
});

module.exports = router;
