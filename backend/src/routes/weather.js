const express = require('express');
const router = express.Router();
const ResearchAgent = require('../agents/ResearchAgent');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Research Agent
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const researchAgent = new ResearchAgent(model);

// Get current weather
router.get('/current', async (req, res) => {
    try {
        console.log('🌤️ Fetching current weather...');
        const weatherData = await researchAgent.getWeatherContext();

        res.json({
            success: true,
            weather: weatherData
        });
    } catch (error) {
        console.error('❌ Weather API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch weather data',
            weather: { available: false, error: 'Service unavailable' }
        });
    }
});

// Get weather forecast (future feature)
router.get('/forecast', async (req, res) => {
    try {
        // TODO: Implement forecast functionality
        res.json({
            success: false,
            error: 'Forecast feature not implemented yet'
        });
    } catch (error) {
        console.error('❌ Weather forecast error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch weather forecast'
        });
    }
});

module.exports = router;
