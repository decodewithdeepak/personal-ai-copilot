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
            // Keyword search in PostgreSQL
            const result = await pool.query(`
        SELECT id, title, content, source, document_type, metadata
        FROM documents 
        WHERE user_id = $1 
        AND (
          title ILIKE $2 OR 
          content ILIKE $2 OR 
          source ILIKE $2
        )
        ORDER BY created_at DESC
        LIMIT 10
      `, [userId, `%${searchQuery}%`]);

            return result.rows.map(row => ({
                id: row.id,
                title: row.title,
                content: row.content,
                source: row.source,
                document_type: row.document_type,
                metadata: row.metadata || {}
            }));
        } catch (error) {
            console.error('❌ Database search error:', error);
            return [];
        }
    }

    async hybridSearch(searchQuery, userId, limit = 5) {
        try {
            // For now, just use database search
            const dbResults = await this.searchDatabase(searchQuery, userId);
            return dbResults.slice(0, limit);
        } catch (error) {
            console.error('❌ Hybrid search error:', error);
            return [];
        }
    }

    async indexUserDocuments(userId) {
        try {
            // Get all user documents from database
            const result = await pool.query(`
        SELECT id, title, content, source, document_type, metadata
        FROM documents 
        WHERE user_id = $1
      `, [userId]);

            // Index each document in memory
            for (const doc of result.rows) {
                await this.addDocument(
                    `${userId}_${doc.id}`,
                    `${doc.title}\n${doc.content}`,
                    {
                        user_id: userId,
                        doc_id: doc.id,
                        source: doc.source,
                        document_type: doc.document_type,
                        ...doc.metadata
                    }
                );
            }

            console.log(`✅ Indexed ${result.rows.length} documents for user ${userId}`);
        } catch (error) {
            console.error('❌ Document indexing error:', error);
        }
    }

    async generateResponse(userQuery, userId) {
        try {
            // Get relevant context
            const context = await this.hybridSearch(userQuery, userId);

            // Generate response using Gemini
            const response = await geminiService.answerQuestion(userQuery, context);

            // Store conversation
            await pool.query(`
        INSERT INTO conversations (user_id, message, response, context)
        VALUES ($1, $2, $3, $4)
      `, [userId, userQuery, response, JSON.stringify(context)]);

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
