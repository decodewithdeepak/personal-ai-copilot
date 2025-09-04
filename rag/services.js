// RAG System - Reference Implementation
//
// This file serves as a reference to the actual RAG implementations
// located in ../backend/src/services/ for better integration and performance.
//
// Actual Files:
// - rag.js: ../backend/src/services/rag.js (now uses ChromaDB)

const path = require('path');

// Export references to actual implementations
module.exports = {
    RAGService: require('../backend/src/services/rag')
};

// Usage Example:
// const { RAGService } = require('./rag/services');
// const response = await RAGService.generateResponse(userMessage, userId);
