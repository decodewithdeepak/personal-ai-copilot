const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is required');
        }

        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }

    async generateResponse(prompt, context = null) {
        try {
            let fullPrompt = prompt;

            if (context) {
                fullPrompt = `Context: ${JSON.stringify(context, null, 2)}\n\nUser Query: ${prompt}`;
            }

            const result = await this.model.generateContent(fullPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('❌ Gemini API error:', error);
            throw new Error('Failed to generate AI response');
        }
    }

    async generateEmbedding(text) {
        try {
            // Note: Gemini doesn't have direct embedding API
            // We'll use a simple text-based approach for now
            // In production, use dedicated embedding models
            const embeddingModel = this.genAI.getGenerativeModel({ model: 'embedding-001' });
            const result = await embeddingModel.embedContent(text);
            return result.embedding.values;
        } catch (error) {
            console.error('❌ Embedding generation error:', error);
            // Fallback: return a simple hash-based embedding
            return this.generateSimpleEmbedding(text);
        }
    }

    generateSimpleEmbedding(text) {
        // Simple fallback embedding generation
        const words = text.toLowerCase().split(/\s+/);
        const embedding = new Array(1536).fill(0);

        words.forEach((word, index) => {
            const hash = this.simpleHash(word);
            embedding[hash % 1536] += 1;
        });

        // Normalize
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    async generateDailyBriefing(tasks, weather, news) {
        const prompt = `
You are a personal AI assistant. Generate a comprehensive daily briefing based on the following information:

TASKS FOR TODAY:
${tasks.map(task => `- ${task.title} (Priority: ${task.priority}, Due: ${task.due_date})`).join('\n')}

WEATHER:
${weather || 'Weather data not available'}

NEWS HIGHLIGHTS:
${news || 'News data not available'}

Please generate a structured daily briefing that includes:
1. Good morning greeting
2. Today's priorities (top 3 tasks)
3. Weather considerations
4. Relevant news summary
5. Productivity suggestions

Keep it concise but informative, around 200-300 words.
`;

        return await this.generateResponse(prompt);
    }

    async answerQuestion(question, context) {
        const prompt = `
You are a helpful personal AI assistant. Answer the user's question based on the provided context.

CONTEXT:
${context.map(item => `- ${item.title}: ${item.content}`).join('\n')}

USER QUESTION: ${question}

Provide a helpful, accurate response based on the context. If the context doesn't contain enough information, say so and provide general guidance.
`;

        return await this.generateResponse(prompt);
    }
}

module.exports = new GeminiService();
