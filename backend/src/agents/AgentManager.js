const { GoogleGenerativeAI } = require('@google/generative-ai');
const PlannerAgent = require('./PlannerAgent');
const ResearchAgent = require('./ResearchAgent');
const SummarizerAgent = require('./SummarizerAgent');

class AgentManager {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Initialize agents
    this.plannerAgent = new PlannerAgent(this.model);
    this.researchAgent = new ResearchAgent(this.model);
    this.summarizerAgent = new SummarizerAgent(this.model);
    
    console.log('🤖 Agent Manager initialized with 3 specialized agents');
  }

  async executeAgentWorkflow(userId, workflowType = 'daily_briefing') {
    try {
      console.log(`🚀 Starting ${workflowType} workflow for user ${userId}`);
      
      switch (workflowType) {
        case 'daily_briefing':
          return await this.generateDailyBriefing(userId);
        case 'task_planning':
          return await this.planTasks(userId);
        case 'research_query':
          return await this.researchQuery(userId);
        default:
          throw new Error(`Unknown workflow type: ${workflowType}`);
      }
    } catch (error) {
      console.error('❌ Agent workflow error:', error);
      throw error;
    }
  }

  async generateDailyBriefing(userId) {
    console.log('📋 Generating daily briefing with agent collaboration...');
    
    // Step 1: Planner Agent analyzes tasks and priorities
    const plannerResults = await this.plannerAgent.analyzeDailyPriorities(userId);
    
    // Step 2: Research Agent gathers external context
    const researchResults = await this.researchAgent.gatherDailyContext();
    
    // Step 3: Summarizer Agent creates the final briefing
    const briefing = await this.summarizerAgent.createDailyBriefing({
      planning: plannerResults,
      research: researchResults,
      userId: userId
    });
    
    return {
      briefing,
      agentContributions: {
        planner: plannerResults,
        research: researchResults
      },
      generatedAt: new Date().toISOString()
    };
  }

  async planTasks(userId) {
    console.log('📅 Running task planning workflow...');
    
    const plannerResults = await this.plannerAgent.optimizeTaskSchedule(userId);
    const researchResults = await this.researchAgent.enhanceTaskContext(plannerResults.tasks);
    
    return {
      optimizedTasks: plannerResults,
      contextualInfo: researchResults,
      recommendations: await this.summarizerAgent.summarizeTaskPlan(plannerResults, researchResults)
    };
  }

  async researchQuery(userId, query) {
    console.log('🔍 Running research workflow...');
    
    const researchResults = await this.researchAgent.deepResearch(query);
    const summary = await this.summarizerAgent.summarizeResearch(researchResults);
    
    return {
      research: researchResults,
      summary: summary
    };
  }

  async getAgentStatus() {
    return {
      agentManager: 'active',
      agents: {
        planner: this.plannerAgent.getStatus(),
        research: this.researchAgent.getStatus(),
        summarizer: this.summarizerAgent.getStatus()
      },
      capabilities: [
        'daily_briefing_generation',
        'task_optimization',
        'external_research',
        'intelligent_summarization'
      ]
    };
  }
}

module.exports = AgentManager;
