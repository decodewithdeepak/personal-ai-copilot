# Personal AI Copilot

A comprehensive AI assistant that automates data collection, uses collaborative agents, and provides intelligent responses through RAG (Retrieval-Augmented Generation).

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
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Git

### 1. Clone and Setup

```bash
git clone <your-repo>
cd personal-ai-copilot
cp .env.example .env
# Edit .env with your API keys
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

## 🔧 Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with pgvector
- **Vector DB:** ChromaDB
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

## 🎯 Features

- ✅ Automated data collection
- ✅ Multi-agent collaboration
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
