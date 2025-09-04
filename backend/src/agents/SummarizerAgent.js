class SummarizerAgent {
  constructor(model) {
    this.model = model;
    this.name = 'Summarizer Agent';
    this.role = 'Intelligent Content Synthesis and Briefing Generation';
    this.status = 'active';
    console.log('📝 Summarizer Agent initialized');
  }

  async createDailyBriefing({ planning, research, userId }) {
    try {
      console.log('📋 Summarizer Agent creating daily briefing...');

      const briefingPrompt = `
        Create a clean, professional daily briefing based on the following information:
        
        PLANNING DATA: ${JSON.stringify(planning, null, 2)}
        RESEARCH DATA: ${JSON.stringify(research, null, 2)}
        USER ID: ${userId}
        DATE: ${new Date().toLocaleDateString()}
        
        Generate a well-formatted daily briefing that includes:
        
        Good Morning Overview
        - Brief welcome and overview for the day
        - Weather conditions and how they might affect productivity
        - Key news headlines that might impact the day
        
        Today's Priorities  
        - Top 3 must-do tasks with reasoning
        - Time-sensitive items and deadlines
        - Energy-optimized scheduling suggestions
        
        Strategic Focus
        - High-impact activities to prioritize
        - Potential challenges and mitigation strategies
        - Opportunities to leverage current trends
        
        External Context
        - Weather impact on work and commute
        - Relevant news and market trends
        - Environmental factors affecting productivity
        
        Action Items
        - Immediate next steps
        - Preparation needed for upcoming tasks
        
        Productivity Insights
        - Optimal work schedule based on task complexity and weather
        - Energy management recommendations
        
        FORMATTING REQUIREMENTS:
        - Use simple, clean text without excessive markdown
        - No asterisks or special characters for emphasis
        - Use clear section headers
        - Keep sentences concise and actionable
        - Use bullet points sparingly
        - Aim for 300-400 words total
        - Professional yet friendly tone
      `;

      const result = await this.model.generateContent(briefingPrompt);
      const briefing = result.response.text();

      // Clean the output
      const cleanBriefing = this.cleanFormatting(briefing);

      return cleanBriefing;
    } catch (error) {
      console.error('❌ Daily briefing creation error:', error);
      throw error;
    }
  }

  async summarizeTaskPlan(plannerResults, researchResults) {
    try {
      console.log('🎯 Summarizer Agent creating task plan summary...');

      const summaryPrompt = `
        Create a concise task planning summary based on:
        
        PLANNER ANALYSIS:
        ${JSON.stringify(plannerResults, null, 2)}
        
        RESEARCH CONTEXT:
        ${JSON.stringify(researchResults, null, 2)}
        
        Provide:
        1. **Priority Assessment** - Why these tasks are prioritized this way
        2. **Timeline Optimization** - Best sequence and timing
        3. **Risk Mitigation** - Potential issues and solutions
        4. **Success Factors** - What will ensure task completion
        5. **Next Steps** - Immediate actions to take
        
        Keep it actionable and under 300 words.
      `;

      const result = await this.model.generateContent(summaryPrompt);
      return this.formatTaskSummary(result.response.text());
    } catch (error) {
      console.error('❌ Task plan summary error:', error);
      throw error;
    }
  }

  async summarizeResearch(researchData) {
    try {
      console.log('🔍 Summarizer Agent creating research summary...');

      const researchPrompt = `
        Summarize this research data into actionable insights:
        
        ${JSON.stringify(researchData, null, 2)}
        
        Provide:
        1. **Key Findings** - Most important discoveries
        2. **Implications** - What this means for decision-making
        3. **Actionable Insights** - Specific steps to take
        4. **Confidence Level** - How reliable is this information
        5. **Recommendation** - What should be done next
        
        Be concise, specific, and actionable.
      `;

      const result = await this.model.generateContent(researchPrompt);
      return this.formatResearchSummary(result.response.text(), researchData);
    } catch (error) {
      console.error('❌ Research summary error:', error);
      throw error;
    }
  }

  async generateWeeklySummary(weeklyData) {
    try {
      console.log('📊 Summarizer Agent creating weekly summary...');

      const weeklyPrompt = `
        Create a comprehensive weekly summary and next week planning based on:
        
        ${JSON.stringify(weeklyData, null, 2)}
        
        Include:
        📈 **Week in Review**
        - Key accomplishments
        - Completed vs planned tasks
        - Productivity patterns
        
        🎯 **Performance Analysis**
        - High-impact activities
        - Time allocation effectiveness
        - Areas for improvement
        
        📋 **Next Week Planning**
        - Carry-over items
        - New priorities
        - Strategic focus areas
        
        💡 **Insights & Recommendations**
        - Productivity optimizations
        - Process improvements
        - Goal adjustments
      `;

      const result = await this.model.generateContent(weeklyPrompt);
      return this.formatWeeklySummary(result.response.text());
    } catch (error) {
      console.error('❌ Weekly summary error:', error);
      throw error;
    }
  }

  cleanFormatting(text) {
    return text
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\*/g, '')   // Remove markdown emphasis
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers
      .replace(/🌅|📋|🎯|🌍|⚡|📊|🤖/g, '') // Remove emojis
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }

  formatBriefing(briefingText, metadata) {
    const header = `
# 🌟 Daily Briefing - ${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}

*Generated by AI Agent Team at ${new Date().toLocaleTimeString()}*

---

`;

    const footer = `

---

*🤖 This briefing was collaboratively generated by:*
- *📅 Planner Agent: Task analysis and priority optimization*
- *🔍 Research Agent: External context and information gathering* 
- *📝 Summarizer Agent: Content synthesis and briefing creation*

*Next briefing: Tomorrow at ${this.getNextBriefingTime()}*
`;

    return header + briefingText + footer;
  }

  formatTaskSummary(summaryText) {
    return {
      summary: summaryText,
      generated_at: new Date().toISOString(),
      type: 'task_planning_summary',
      agent: this.name
    };
  }

  formatResearchSummary(summaryText, originalData) {
    return {
      summary: summaryText,
      sources: this.extractSources(originalData),
      confidence_score: originalData.confidence_score || 0.7,
      generated_at: new Date().toISOString(),
      type: 'research_summary',
      agent: this.name
    };
  }

  formatWeeklySummary(summaryText) {
    return {
      summary: summaryText,
      week_ending: new Date().toISOString(),
      type: 'weekly_summary',
      agent: this.name,
      next_review: this.getNextWeeklyReview()
    };
  }

  extractSources(researchData) {
    const sources = [];
    if (researchData.news && !researchData.news.error) sources.push('News API');
    if (researchData.weather && !researchData.weather.error) sources.push('Weather API');
    if (researchData.market && !researchData.market.error) sources.push('Market Data');
    return sources;
  }

  getNextBriefingTime() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0); // 8 AM next day
    return tomorrow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getNextWeeklyReview() {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay())); // Next Sunday
    return nextWeek.toISOString();
  }

  async createPersonalizedSummary(data, userPreferences = {}) {
    try {
      const personalizedPrompt = `
        Create a personalized summary based on user preferences:
        
        DATA: ${JSON.stringify(data, null, 2)}
        USER PREFERENCES: ${JSON.stringify(userPreferences, null, 2)}
        
        Adapt the tone, length, and focus areas based on user preferences.
        Include relevant insights while respecting communication style preferences.
      `;

      const result = await this.model.generateContent(personalizedPrompt);
      return result.response.text();
    } catch (error) {
      console.error('❌ Personalized summary error:', error);
      throw error;
    }
  }

  async generateInsights(historicalData) {
    try {
      const insightsPrompt = `
        Analyze this historical data to generate productivity insights:
        
        ${JSON.stringify(historicalData, null, 2)}
        
        Identify:
        1. Productivity patterns
        2. Peak performance times
        3. Common bottlenecks
        4. Success factors
        5. Improvement opportunities
        
        Provide actionable recommendations.
      `;

      const result = await this.model.generateContent(insightsPrompt);
      return {
        insights: result.response.text(),
        generated_at: new Date().toISOString(),
        data_points: Array.isArray(historicalData) ? historicalData.length : 1
      };
    } catch (error) {
      console.error('❌ Insights generation error:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      name: this.name,
      role: this.role,
      status: this.status,
      capabilities: [
        'daily_briefing_creation',
        'task_plan_summarization',
        'research_synthesis',
        'weekly_summaries',
        'personalized_content',
        'productivity_insights'
      ],
      output_formats: [
        'markdown',
        'structured_json',
        'plain_text'
      ]
    };
  }
}

module.exports = SummarizerAgent;
