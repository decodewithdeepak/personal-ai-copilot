class EmbeddingService {
  constructor() {
    this.embeddingCache = new Map(); // In-memory cache for now
  }

  // Generate embeddings using Gemini
  async generateEmbedding(text) {
    try {
      // Check cache first
      if (this.embeddingCache.has(text)) {
        return this.embeddingCache.get(text);
      }

      // For now, create a simple hash-based embedding
      // TODO: Replace with actual Gemini embedding API when available
      const embedding = this.createSimpleEmbedding(text);
      
      // Cache the result
      this.embeddingCache.set(text, embedding);
      
      return embedding;
    } catch (error) {
      console.error('❌ Embedding generation error:', error);
      throw error;
    }
  }

  // Simple embedding generator (placeholder)
  createSimpleEmbedding(text) {
    // Create a 768-dimensional embedding based on text characteristics
    const embedding = new Array(768).fill(0);
    
    // Simple algorithm: character codes, word length, etc.
    for (let i = 0; i < text.length && i < 768; i++) {
      embedding[i] = (text.charCodeAt(i) % 256) / 255.0;
    }
    
    // Add some word-based features
    const words = text.toLowerCase().split(' ');
    for (let i = 0; i < words.length && i < 100; i++) {
      const wordHash = this.hashCode(words[i]) % 668; // Leave room for char features
      embedding[100 + wordHash] = Math.min(1.0, embedding[100 + wordHash] + 0.1);
    }
    
    return embedding;
  }

  // Simple hash function
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Calculate cosine similarity between two embeddings
  calculateSimilarity(embedding1, embedding2) {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  // Find similar documents (in-memory for now)
  async findSimilarDocuments(queryEmbedding, documents, limit = 5) {
    const similarities = documents.map(doc => ({
      ...doc,
      similarity: this.calculateSimilarity(queryEmbedding, doc.embedding)
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Store document with embedding (in-memory for now)
  async storeDocument(title, content, metadata = {}) {
    const embedding = await this.generateEmbedding(content);
    
    const document = {
      id: Date.now() + Math.random(), // Simple ID generation
      title,
      content,
      metadata,
      embedding,
      created_at: new Date()
    };

    // In production, this would go to the database
    console.log(`📄 Document stored: ${title} (${embedding.length}D embedding)`);
    
    return document;
  }
}

module.exports = new EmbeddingService();
