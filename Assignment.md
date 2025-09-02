# Personal AI Copilot

## Goal

Design and implement a Personal AI Copilot that:

- Automates routine data collection & reminders (via n8n)
- Collaborates through a team of agents (CrewAI)
- Understands and retrieves context from a personal + external knowledge base (Agentic RAG)
- Delivers a seamless user experience through a full-stack app

This isn’t just a demo — it should feel like the first prototype of a real product.

## Core Requirements

### 1. Automation Layer (n8n)

Create workflows that:

- Pull personal data (calendar, tasks, notes, or emails)
- Fetch external data (news, weather, finance, or custom domain APIs)
- Push everything into a shared knowledge store (vector DB + relational DB for metadata)
- Trigger proactive reminders (Slack/Discord/email)

Workflows must be re-runnable & observable (logs, error handling).

**Skills tested:** API orchestration, workflow reliability, automation design

### 2. Agent Layer (CrewAI)

Implement at least 3 specialized agents:

- **Planner Agent** → Reviews calendar, notes, deadlines; suggests priorities
- **Research Agent** → Enriches knowledge with external context (e.g., “latest AI papers” or “market updates”)
- **Summarizer Agent** → Writes a Daily Briefing (tasks + events + news) in a structured format

Agents must negotiate & collaborate (not just pass outputs sequentially). Example: Planner asks Research if there’s relevant news before making final schedule suggestions.

**Skills tested:** multi-agent coordination, prompt engineering, reasoning workflows

### 3. Knowledge Layer (Agentic RAG)

Build a RAG system that can:

- Query across personal data (notes, tasks, past interactions) + external knowledge (API-ingested docs/news)
- Perform dynamic retrieval (choosing how many sources to pull, reranking them)
- Handle follow-up queries (multi-turn memory)

Example queries to support:

- “Summarize my week + top 3 relevant news from today.”
- “Reschedule tomorrow’s meeting if it clashes with gym.”
- “What did I read about AI regulation last month?”

**Skills tested:** retrieval design, reasoning, memory handling

### 4. Interface Layer (Full-Stack App)

Build a dashboard where the user can:

- Chat with the assistant (query tasks, news, notes, reminders)
- View a Daily Briefing card (Events → Tasks → Top News → Suggestions)
- Add tasks/notes directly into the system (flows back to n8n + DB)
- Receive proactive alerts (“⚠️ Meeting clash at 3PM”)

Backend orchestrates CrewAI + RAG → feeds frontend.

Deploy end-to-end (Dockerized backend, frontend on Vercel/Netlify).

**Skills tested:** frontend polish, API orchestration, state management, deployment

## Deliverables

### Repo Structure

```
/n8n → exported workflows
/crew → agent definitions + orchestration logic
/rag → retrieval pipeline code
/frontend → web app
/backend → orchestrator APIs
```

### Demo Video (7–8 min)

Show a day-in-the-life flow:

- Data ingestion running (via n8n)
- Assistant generating Daily Briefing
- User asking a contextual query (e.g., “Summarize tasks + related articles”)
- Agents negotiating a scheduling conflict
- Notification fired

### Documentation

- Setup instructions
- Architecture diagram (how each layer connects)
- Agent role descriptions
- Sample queries with expected outputs

## Evaluation Rubric

- **Integration Depth (30%)** → Does it all work as one system?
- **Agent Intelligence (25%)** → Do CrewAI agents collaborate or just pass data?
- **Retrieval Quality (20%)** → Is RAG naive (dump search results) or smart (filters, reasoning)?
- **User Experience (15%)** → Is the assistant usable, clean, intuitive?
- **Resilience (10%)** → Error handling, retries, fallback behaviors

## Stretch Goals (Bonus)

- Voice interface (mic → speech → assistant response)
- Multi-user mode (separate knowledge bases)
- Smart notifications (e.g., “Weather says rain, reschedule run to morning”)
- Agent debates (Planner vs Research Agent explaining different suggestions)

## AI Usage Disclosure Requirement

As part of this assignment, the developer must explicitly mention wherever they use AI during development.

If AI tools (e.g., ChatGPT, Copilot, Claude, Cursor, etc.) are used for:

- Writing code
- Debugging or fixing errors
- Generating documentation or README content
- Designing architecture or data flows

The developer should add a short note or comment in the relevant place (code comments, docs, or a separate `AI_USAGE.md` file) stating:

- Where AI was used
- How it contributed (e.g., "initial draft of README generated with AI, later refined manually").
