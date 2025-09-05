# Personal AI Copilot

A comprehensive AI assistant that automates data collection, uses collaborative agents, and provides intelligent responses through RAG (Retrieval-Augmented Generation) with **multi-channel notifications** across Slack, Discord, Email, WhatsApp, GitHub, and Telegram.

## 🏗️ Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   n8n       │    │   CrewAI    │    │    RAG      │
│ Automation  │────│   Agents    │────│  Knowledge  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                  ┌─────────────┐
                  │  Next.js    │
                  │  Frontend   │
                  └─────────────┘
                           │
                  ┌─────────────┐
                  │  Node.js    │
                  │  Backend    │
                  └─────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
  │ PostgreSQL  │ │  ChromaDB   │ │    Redis    │
  │   Database  │ │   Vectors   │ │   Cache     │
  └─────────────┘ └─────────────┘ └─────────────┘
                           │
              ┌────────────────────────────────┐
              │      Multi-Channel Notifications │
              └────────────────────────────────┘
                           │
    ┌──────┬──────┬─────────┼─────────┬──────┬──────┐
    │      │      │         │         │      │      │
┌───▼──┐ ┌─▼──┐ ┌─▼───┐ ┌───▼───┐ ┌───▼──┐ ┌▼──┐ ┌▼─────┐
│Slack │ │Discord│ │Email│ │WhatsApp│ │GitHub│ │SMS│ │Telegram│
└──────┘ └────┘ └─────┘ └───────┘ └──────┘ └───┘ └───────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Git

### 1. Clone and Setup Environment

```bash
git clone <your-repo>
cd personal-ai-copilot

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your API keys (see ENV_SETUP_GUIDE.md for details)
```

### 2. Start Services

```bash
docker-compose up -d
```

### 3. Initialize Database

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
```

### 4. Start Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
/n8n              → Exported n8n workflows
/crew             → CrewAI agent definitions
/rag              → RAG pipeline implementation
/frontend         → Next.js web application
/backend          → Node.js API server
/docs             → Documentation & diagrams
```

## 🤖 Agents

### Planner Agent

- Reviews calendar and tasks
- Suggests daily priorities
- Identifies scheduling conflicts

### Research Agent

- Fetches relevant external context
- Monitors news and updates
- Enriches knowledge base

### Summarizer Agent

- Creates daily briefings
- Synthesizes information
- Generates actionable insights

## Multi-Channel Notifications

### Supported Platforms

- **Slack** - Team collaboration & daily briefings
- **Discord** - Community updates & urgent alerts
- **Email** - Formal notifications & detailed reports
- **WhatsApp** - Mobile-first quick alerts
- **GitHub** - Issue tracking & project updates
- **Telegram** - Instant messaging & reminders
- **SMS** - Critical emergency alerts

### Smart Notification Logic

- 🌅 **Morning Briefing** (8 AM): Full daily summary
- 📊 **Midday Update** (12 PM): Progress check & reminders
- 🌆 **Evening Wrap-up** (5 PM): Task completion & tomorrow's prep
- 🚨 **Urgent Alerts**: Immediate multi-channel notifications for overdue tasks
- 📈 **GitHub Integration**: Auto-create tasks from issues/PRs

## Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, TypeScript
- **Database:** NeonDB PostgreSQL (cloud-hosted)
- **Vector DB:** ChromaDB (dedicated vector storage)
- **AI:** Google Gemini API
- **Automation:** n8n
- **Agents:** CrewAI
- **Deployment:** Docker, Vercel

## 📚 API Documentation

### Core Endpoints

- `GET /api/briefing` - Get daily briefing
- `POST /api/chat` - Chat with AI assistant
- `POST /api/tasks` - Add new task
- `GET /api/notifications` - Get notifications
- `POST /webhook/github` - GitHub integration webhook
- `GET /api/integrations/status` - Check all platform connections

## 🎯 Features

- ✅ Automated data collection
- ✅ Multi-agent collaboration
- ✅ **Multi-channel notifications** (Slack, Discord, Email, WhatsApp, GitHub, Telegram)
- ✅ **Smart scheduling** with urgency detection
- ✅ **GitHub integration** with auto-task creation
- ✅ Intelligent RAG system
- ✅ Real-time notifications
- ✅ Interactive dashboard
- ✅ Voice interface (bonus)

## 🛠️ Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
docker-compose -f docker-compose.prod.yml up --build
```

## 📖 AI Usage Disclosure

This project uses AI assistance for:

- Code generation and debugging
- Documentation writing
- Architecture design
- Prompt engineering

See `AI_USAGE.md` for detailed disclosure.

## 📄 License

MIT License
