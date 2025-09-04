const pool = require('../database/connection');
const geminiService = require('./gemini');

class RAGService {
    constructor() {
        // For development, we'll use simple in-memory storage instead of ChromaDB
        this.documents = new Map();
        this.initialized = true;
        console.log('✅ RAG Service initialized (in-memory mode)');
    }

    async initialize() {
        // Already initialized in constructor
        return true;
    }

    async addDocument(id, content, metadata = {}) {
        try {
            // Store in memory for now
            this.documents.set(id.toString(), {
                content,
                metadata,
                embedding: await geminiService.generateEmbedding(content)
            });

            console.log(`✅ Document ${id} added to vector store`);
        } catch (error) {
            console.error('❌ Error adding document:', error);
        }
    }

    async searchSimilar(query, limit = 5) {
        try {
            // Simple similarity search using in-memory storage
            const queryEmbedding = await geminiService.generateEmbedding(query);
            const results = [];

            for (const [id, doc] of this.documents.entries()) {
                const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
                results.push({
                    id,
                    content: doc.content,
                    metadata: doc.metadata,
                    score: similarity
                });
            }

            return results
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);
        } catch (error) {
            console.error('❌ Error searching documents:', error);
            return [];
        }
    }

    cosineSimilarity(a, b) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    async searchDatabase(searchQuery, userId) {
        try {
            // Search across multiple data sources
            const results = [];

            // 1. Always search tasks for any query (users often ask about their work)
            const taskResult = await pool.query(`
                SELECT id, title, description, status, priority, due_date, created_at
                FROM tasks 
                WHERE user_id = $1 
                ORDER BY 
                    CASE priority 
                        WHEN 'high' THEN 1 
                        WHEN 'medium' THEN 2 
                        WHEN 'low' THEN 3 
                    END,
                    due_date ASC NULLS LAST
            `, [userId]);

            taskResult.rows.forEach(task => {
                results.push({
                    id: `task_${task.id}`,
                    title: task.title,
                    content: `Task: ${task.title}\nDescription: ${task.description}\nStatus: ${task.status}\nPriority: ${task.priority}\nDue: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}`,
                    source: 'tasks',
                    metadata: task
                });
            });

            console.log(`📋 Found ${taskResult.rows.length} tasks for user ${userId}`);

            // 2. Try to search chat history for context (optional)
            try {
                const chatResult = await pool.query(`
                    SELECT message, response, created_at
                    FROM chat_history 
                    WHERE user_id = $1 
                    ORDER BY created_at DESC 
                    LIMIT 5
                `, [userId]);

                chatResult.rows.forEach(chat => {
                    results.push({
                        id: `chat_${chat.created_at}`,
                        title: 'Previous conversation',
                        content: `Q: ${chat.message}\nA: ${chat.response}`,
                        source: 'chat_history',
                        metadata: chat
                    });
                });

                console.log(`💬 Found ${chatResult.rows.length} chat history items`);
            } catch (chatError) {
                console.log('💬 Chat history table not found (this is fine)');
            }

            return results;
        } catch (error) {
            console.error('❌ Database search error:', error);
            return [];
        }
    }

    async searchUserData(searchQuery, userId, limit = 5) {
        try {
            // Search user's actual data (tasks and chat history)
            const results = await this.searchDatabase(searchQuery, userId);
            console.log(`🔍 Found ${results.length} relevant items for: "${searchQuery}"`);
            return results.slice(0, limit);
        } catch (error) {
            console.error('❌ Search error:', error);
            return [];
        }
    }

    async generateResponse(userQuery, userId) {
        try {
            // Get relevant context from user's data
            const context = await this.searchUserData(userQuery, userId);

            // Generate response using Gemini
            const response = await geminiService.answerQuestion(userQuery, context);

            // Store conversation (optional - if table exists)
            try {
                await pool.query(`
                    INSERT INTO conversations (user_id, message, response, context)
                    VALUES ($1, $2, $3, $4)
                `, [userId, userQuery, response, JSON.stringify(context)]);
            } catch (storeError) {
                console.log('💾 Could not store conversation (table may not exist)');
            }

            return {
                response,
                context,
                sources: context.map(c => c.source || 'unknown').filter(Boolean)
            };
        } catch (error) {
            console.error('❌ RAG response generation error:', error);
            throw error;
        }
    }
}

module.exports = new RAGService();
