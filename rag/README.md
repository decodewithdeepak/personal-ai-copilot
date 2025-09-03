# Agentic RAG System

## 🧠 Retrieval-Augmented Generation Implementation

The RAG system is implemented in the backend for optimal performance and database connectivity.

### RAG Components Locations:

- **RAG Service**: `../backend/src/services/rag.js`
- **Embedding Service**: `../backend/src/services/embedding.js`
- **Vector Database**: `../backend/src/database/vectorStore.js`
- **Chat Memory**: `../backend/src/services/memory.js`

### Architecture:

```
Query → Embedding → Vector Search → Context Retrieval → LLM Generation
  ↓         ↓           ↓              ↓                ↓
User    OpenAI API  PostgreSQL    Smart Filtering   Gemini AI
Input   Embeddings  JSON Vector   & Reranking       Response
```

### Key Features:

- ✅ **Dynamic Retrieval**: Chooses optimal number of sources
- ✅ **Smart Reranking**: Context-aware result ordering
- ✅ **Multi-turn Memory**: Conversation context retention
- ✅ **Cross-domain Search**: Personal + external knowledge
- ✅ **Semantic Understanding**: Vector-based similarity

### Database Schema:

```sql
-- Vector embeddings stored as JSON
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    embedding JSON, -- 768-dimensional vector
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Usage:

```javascript
const ragService = require('../backend/src/services/rag');
const response = await ragService.query(userMessage, userId, conversationId);
```

## 🔍 Query Examples:

1. **Personal Context**: "What are my priorities today?"
2. **External Knowledge**: "Latest AI developments"
3. **Cross-domain**: "Schedule conflicts with weather considerations"
4. **Follow-up**: "Tell me more about the second item"

## 🚀 Performance Features:

- **Efficient Vector Search**: PostgreSQL with JSON indexing
- **Caching Layer**: Frequently accessed embeddings
- **Parallel Processing**: Multiple retrieval strategies
- **Fallback Mechanisms**: Graceful degradation

See `../backend/src/services/` for complete RAG implementation.
