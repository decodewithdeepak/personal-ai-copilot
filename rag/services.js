// RAG System - Reference Implementation
//
// This file serves as a reference to the actual RAG implementations
// located in ../backend/src/services/ for better integration and performance.
//
// Actual Files:
// - rag.js: ../backend/src/services/rag.js
// - embedding.js: ../backend/src/services/embedding.js
// - memory.js: ../backend/src/services/memory.js
// - vectorStore.js: ../backend/src/database/vectorStore.js

const path = require('path');

// Export references to actual implementations
module.exports = {
    RAGService: require('../backend/src/services/rag'),
    EmbeddingService: require('../backend/src/services/embedding'),
    MemoryService: require('../backend/src/services/memory'),
    VectorStore: require('../backend/src/database/vectorStore')
};

// Usage Example:
// const { RAGService } = require('./rag/services');
// const response = await RAGService.query(userMessage, userId, conversationId);
