const axios = require('axios');

class ResearchAgent {
  constructor(model) {
    this.model = model;
    this.name = 'Research Agent';
    this.role = 'External Context and Information Gathering';
    this.status = 'active';
    this.newsAPI = process.env.NEWS_API_KEY;
    this.weatherAPI = process.env.WEATHER_API_KEY; // Fixed: was OPENWEATHER_API_KEY
    console.log('🔍 Research Agent initialized');
    console.log(`🔍 Weather API configured: ${this.weatherAPI ? 'Yes' : 'No'}`);
    console.log(`🔍 News API configured: ${this.newsAPI ? 'Yes' : 'No'}`);
  }

  async gatherDailyContext() {
    try {
      console.log('🌍 Research Agent gathering daily context...');

      const [weather, news, marketData] = await Promise.allSettled([
        this.getWeatherContext(),
        this.getNewsContext(),
        this.getMarketContext()
      ]);

      return {
        weather: weather.status === 'fulfilled' ? weather.value : null,
        news: news.status === 'fulfilled' ? news.value : null,
        market: marketData.status === 'fulfilled' ? marketData.value : null,
        timestamp: new Date().toISOString(),
        sources: ['OpenWeather', 'NewsAPI', 'Financial APIs']
      };
    } catch (error) {
      console.error('❌ Research Agent context gathering error:', error);
      return {
        error: 'Failed to gather external context',
        timestamp: new Date().toISOString()
      };
    }
  }

  async enhanceTaskContext(tasks) {
    try {
      console.log('📈 Research Agent enhancing task context...');

      const enhancedTasks = [];

      for (const task of tasks.slice(0, 5)) { // Limit to prevent API overuse
        const context = await this.getTaskRelevantInfo(task);
        enhancedTasks.push({
          ...task,
          external_context: context
        });
      }

      return {
        enhanced_tasks: enhancedTasks,
        context_sources: ['web_search', 'news', 'trends'],
        enhancement_timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Task context enhancement error:', error);
      return { error: 'Failed to enhance task context' };
    }
  }

  async deepResearch(query) {
    try {
      console.log(`🔬 Research Agent conducting deep research on: ${query}`);

      const [newsResults, webContext] = await Promise.allSettled([
        this.searchNews(query),
        this.getWebContext(query)
      ]);

      const researchData = {
        query: query,
        news: newsResults.status === 'fulfilled' ? newsResults.value : null,
        web_context: webContext.status === 'fulfilled' ? webContext.value : null,
        research_timestamp: new Date().toISOString()
      };

      // Use AI to synthesize findings
      const synthesis = await this.synthesizeResearch(researchData);

      return {
        ...researchData,
        synthesis: synthesis,
        confidence_score: this.calculateConfidenceScore(researchData)
      };
    } catch (error) {
      console.error('❌ Deep research error:', error);
      throw error;
    }
  }

  async getWeatherContext() {
    if (!this.weatherAPI) {
      console.log('⚠️ Weather API key not configured');
      return { error: 'Weather API key not configured', available: false };
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=Delhi,IN&appid=${this.weatherAPI}&units=metric`,
        { timeout: 8000 } // 8 second timeout
      );

      const weather = response.data;
      return {
        available: true,
        location: weather.name,
        temperature: weather.main.temp,
        condition: weather.weather[0].description,
        humidity: weather.main.humidity,
        wind_speed: weather.wind?.speed || 0,
        impact_assessment: this.assessWeatherImpact(weather)
      };
    } catch (error) {
      console.error('Weather API error:', error);
      if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        return { error: 'Weather service temporarily unavailable', available: false };
      }
      return { error: 'Failed to fetch weather data', available: false };
    }
  }

  async getNewsContext() {
    if (!this.newsAPI) {
      console.log('⚠️ News API key not configured');
      return { error: 'News API key not configured', available: false };
    }

    try {
      // Try multiple news sources for better coverage
      const queries = [
        `https://newsapi.org/v2/top-headlines?country=in&category=technology&pageSize=3&apiKey=${this.newsAPI}`,
        `https://newsapi.org/v2/top-headlines?country=in&category=business&pageSize=2&apiKey=${this.newsAPI}`,
        `https://newsapi.org/v2/top-headlines?country=us&category=technology&pageSize=2&apiKey=${this.newsAPI}`
      ];

      const results = await Promise.allSettled(
        queries.map(url => axios.get(url, { timeout: 8000 }))
      );

      let allArticles = [];
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.data.articles) {
          allArticles = [...allArticles, ...result.value.data.articles];
        }
      });

      if (allArticles.length === 0) {
        return { error: 'No news articles found', available: false };
      }

      const articles = allArticles.slice(0, 5).map(article => ({
        title: article.title,
        description: article.description,
        source: article.source.name,
        published: article.publishedAt,
        relevance_score: this.calculateRelevanceScore(article)
      }));

      return {
        available: true,
        headlines: articles,
        summary: await this.summarizeNews(articles),
        trending_topics: this.extractTrendingTopics(articles)
      };
    } catch (error) {
      console.error('News API error:', error);
      return { error: 'Failed to fetch news data', available: false };
    }
  }

  async getMarketContext() {
    // Simulated market data - in production, integrate with financial APIs
    return {
      market_status: 'open',
      major_indices: {
        nifty50: { value: 24500, change: '+0.8%' },
        sensex: { value: 80200, change: '+1.2%' },
        nasdaq: { value: 17800, change: '-0.3%' }
      },
      sentiment: 'neutral',
      key_movers: ['Tech stocks', 'Banking sector'],
      analysis: 'Market showing mixed signals with tech leading gains'
    };
  }

  async getTaskRelevantInfo(task) {
    try {
      // Use AI to determine what external info would be relevant for this task
      const relevancePrompt = `
        For the task "${task.title}" with description "${task.description}", 
        what type of external information would be most helpful?
        Consider: market trends, weather impact, news relevance, timing factors.
        Provide 2-3 specific search queries that would enhance task execution.
      `;

      const result = await this.model.generateContent(relevancePrompt);
      const suggestions = result.response.text();

      return {
        ai_suggestions: suggestions,
        context_type: this.determineContextType(task),
        external_factors: this.identifyExternalFactors(task)
      };
    } catch (error) {
      console.error('Task context error:', error);
      return { error: 'Failed to get task context' };
    }
  }

  async searchNews(query) {
    if (!this.newsAPI) {
      return { error: 'News API not available' };
    }

    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=3&apiKey=${this.newsAPI}`
      );

      return response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        source: article.source.name,
        url: article.url,
        published: article.publishedAt
      }));
    } catch (error) {
      console.error('News search error:', error);
      return { error: 'Failed to search news' };
    }
  }

  async getWebContext(query) {
    // Simulate web context - in production, integrate with search APIs
    return {
      query: query,
      trending: true,
      related_topics: ['AI development', 'productivity tools', 'automation'],
      confidence: 0.85
    };
  }

  async synthesizeResearch(researchData) {
    const synthesisPrompt = `
      Synthesize this research data into actionable insights:
      ${JSON.stringify(researchData, null, 2)}
      
      Provide:
      1. Key findings summary
      2. Actionable insights
      3. Potential implications
      4. Recommended actions
      5. Confidence assessment
    `;

    const result = await this.model.generateContent(synthesisPrompt);
    return result.response.text();
  }

  assessWeatherImpact(weather) {
    const temp = weather.main.temp;
    const condition = weather.weather[0].main.toLowerCase();

    let impact = 'neutral';
    if (temp > 35) impact = 'high_heat_advisory';
    else if (temp < 5) impact = 'cold_weather_caution';
    else if (condition.includes('rain')) impact = 'rain_delays_possible';

    return impact;
  }

  calculateRelevanceScore(article) {
    // Simple relevance scoring based on keywords
    const keywords = ['technology', 'ai', 'productivity', 'business', 'innovation'];
    const text = (article.title + ' ' + article.description).toLowerCase();
    const score = keywords.reduce((acc, keyword) =>
      text.includes(keyword) ? acc + 1 : acc, 0
    );
    return Math.min(score / keywords.length, 1);
  }

  async summarizeNews(articles) {
    const newsText = articles.map(a => `${a.title}: ${a.description}`).join('\n');
    const summaryPrompt = `Summarize these news headlines in 2-3 key points: ${newsText}`;

    const result = await this.model.generateContent(summaryPrompt);
    return result.response.text();
  }

  extractTrendingTopics(articles) {
    // Simple keyword extraction - in production, use NLP libraries
    const allText = articles.map(a => a.title + ' ' + a.description).join(' ').toLowerCase();
    const words = allText.split(/\s+/);
    const wordCount = {};

    words.forEach(word => {
      if (word.length > 4) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  determineContextType(task) {
    const title = task.title.toLowerCase();
    if (title.includes('meeting') || title.includes('call')) return 'scheduling';
    if (title.includes('research') || title.includes('analysis')) return 'information';
    if (title.includes('travel') || title.includes('visit')) return 'logistics';
    return 'general';
  }

  identifyExternalFactors(task) {
    return {
      weather_dependent: task.title.toLowerCase().includes('outdoor'),
      time_sensitive: task.priority === 'high',
      market_relevant: task.title.toLowerCase().includes('business')
    };
  }

  calculateConfidenceScore(researchData) {
    let score = 0.5; // Base score
    if (researchData.news && !researchData.news.error) score += 0.2;
    if (researchData.web_context && !researchData.web_context.error) score += 0.2;
    if (researchData.synthesis) score += 0.1;
    return Math.min(score, 1);
  }

  getStatus() {
    return {
      name: this.name,
      role: this.role,
      status: this.status,
      capabilities: [
        'weather_analysis',
        'news_gathering',
        'market_research',
        'context_enhancement'
      ],
      api_status: {
        weather: !!this.weatherAPI,
        news: !!this.newsAPI
      }
    };
  }
}

module.exports = ResearchAgent;
