# CrewAI Multi-Agent System

## 🤖 Agent Implementation

The CrewAI agents are implemented in the backend for better integration and performance.

### Agent Locations:

- **PlannerAgent**: `../backend/src/agents/PlannerAgent.js`
- **ResearchAgent**: `../backend/src/agents/ResearchAgent.js`
- **SummarizerAgent**: `../backend/src/agents/SummarizerAgent.js`
- **AgentManager**: `../backend/src/agents/AgentManager.js`

### Agent Collaboration Flow:

```
PlannerAgent → Reviews tasks and calendar
     ↓
ResearchAgent → Gathers external context (news, weather)
     ↓
SummarizerAgent → Creates structured daily briefing
     ↓
AgentManager → Orchestrates collaboration
```

### Key Features:

- ✅ True multi-agent collaboration (not sequential)
- ✅ Dynamic decision making based on context
- ✅ Agent negotiation and consensus building
- ✅ External API integration for enriched insights

### Usage:

```javascript
const agentManager = new AgentManager();
const result = await agentManager.executeAgentWorkflow(
	userId,
	'daily_briefing'
);
```

## 🔧 Technical Architecture

The agents use CrewAI principles with:

- **Role-based specialization**
- **Goal-oriented behavior**
- **Collaborative decision making**
- **Memory and context sharing**

See `../backend/src/agents/` for complete implementation.
