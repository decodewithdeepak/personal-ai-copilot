# Agentic RAG System

## 🧠 Retrieval-Augmented Generation Implementation

The RAG system uses ChromaDB vector database for production-ready semantic search.

### RAG Components Locations:

- **RAG Service**: `../backend/src/services/rag.js`
- **Vector Database**: ChromaDB (running in Docker container)
- **Embeddings**: Google Gemini API for vector generation

### Architecture:

```
Query → Embedding → Vector Search → Context Retrieval → LLM Generation
  ↓         ↓           ↓              ↓                ↓
User    Gemini API   ChromaDB      Smart Filtering   Gemini AI
Input   Embeddings   Vector DB     & Reranking       Response
```

### Key Features:

- ✅ **Production Vector DB**: ChromaDB for scalable vector storage
- ✅ **Smart Fallback**: In-memory mode if ChromaDB unavailable
- ✅ **Persistent Storage**: Vectors survive server restarts
- ✅ **Semantic Understanding**: Advanced similarity search
- ✅ **Multi-source Data**: Tasks, chat history, and documents

### ChromaDB Integration:

```javascript
// Documents are automatically stored in ChromaDB with embeddings
await ragService.addDocument('doc_id', 'content', { metadata });

// Semantic search across all documents
const results = await ragService.searchSimilar('query', limit);

// Search user-specific data (tasks, chat history)
const userResults = await ragService.searchUserData('query', userId, limit);
```

### Usage:

```javascript
const ragService = require('../backend/src/services/rag');
const response = await ragService.generateResponse(userMessage, userId);
```

## 🔍 Query Examples:

1. **Personal Context**: "What are my priorities today?"
2. **Document Search**: "Find documents about machine learning"
3. **Task Management**: "Show me high priority tasks"
4. **Cross-domain**: "Recent conversations about AI"

## 🚀 Performance Features:

- **Dedicated Vector Database**: ChromaDB for optimal performance
- **Persistent Storage**: Vectors survive server restarts
- **Smart Fallback**: In-memory mode if ChromaDB unavailable
- **Multi-source Search**: Documents, tasks, and chat history

See `../backend/src/services/rag.js` for complete implementation.
