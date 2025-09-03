// CrewAI Agent System - Reference Implementation
// 
// This file serves as a reference to the actual agent implementations
// located in ../backend/src/agents/ for better integration and performance.
//
// Actual Files:
// - PlannerAgent.js: ../backend/src/agents/PlannerAgent.js
// - ResearchAgent.js: ../backend/src/agents/ResearchAgent.js  
// - SummarizerAgent.js: ../backend/src/agents/SummarizerAgent.js
// - AgentManager.js: ../backend/src/agents/AgentManager.js

const path = require('path');

// Export references to actual implementations
module.exports = {
    PlannerAgent: require('../backend/src/agents/PlannerAgent'),
    ResearchAgent: require('../backend/src/agents/ResearchAgent'),
    SummarizerAgent: require('../backend/src/agents/SummarizerAgent'),
    AgentManager: require('../backend/src/agents/AgentManager')
};

// Usage Example:
// const { AgentManager } = require('./crew/agents');
// const agentManager = new AgentManager();
// const result = await agentManager.executeAgentWorkflow(userId, 'daily_briefing');
