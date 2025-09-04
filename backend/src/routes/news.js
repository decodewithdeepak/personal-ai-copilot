const express = require('express');
const router = express.Router();
const ResearchAgent = require('../agents/ResearchAgent');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Research Agent
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const researchAgent = new ResearchAgent(model);

// Get latest news headlines
router.get('/headlines', async (req, res) => {
    try {
        console.log('📰 Fetching latest news headlines...');
        const newsData = await researchAgent.getNewsContext();

        res.json({
            success: true,
            news: newsData
        });
    } catch (error) {
        console.error('❌ News API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch news data',
            news: { available: false, error: 'Service unavailable' }
        });
    }
});

// Get news by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        console.log(`📰 Fetching ${category} news...`);

        // TODO: Implement category-specific news
        res.json({
            success: false,
            error: 'Category news feature not implemented yet'
        });
    } catch (error) {
        console.error('❌ Category news error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch category news'
        });
    }
});

// Search news
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        console.log(`🔍 Searching news for: ${q}`);

        // TODO: Implement news search
        res.json({
            success: false,
            error: 'News search feature not implemented yet'
        });
    } catch (error) {
        console.error('❌ News search error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search news'
        });
    }
});

module.exports = router;
