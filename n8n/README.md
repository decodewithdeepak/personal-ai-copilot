# Personal AI Copilot - n8n Automation Layer

This directory contains the automation workflows that power your Personal AI Copilot using n8n.

## 🚀 Quick Start

1. **Start n8n:**
   ```bash
   cd n8n
   ./start.sh
   ```

2. **Access n8n Dashboard:**
   - URL: http://localhost:5678
   - **First time setup:** Create an admin account with your preferred email/password
   - **After setup:** Login with your credentials

3. **Import Workflows:**
   - Go to n8n dashboard
   - Click "Import from File"
   - Import each workflow JSON from `./workflows/`

## 📋 Available Workflows

### 1. Daily Briefing Automation
**File:** `daily-briefing-automation.json`
**Schedule:** Every day at 8:00 AM
**Purpose:** 
- Triggers your AI agents to generate daily briefing
- Fetches weather data and tech news
- Stores context in RAG system
- Sends email briefing

### 2. Smart Task Management  
**File:** `smart-task-management.json`
**Schedule:** Every 4 hours
**Purpose:**
- Monitors pending tasks
- Generates optimized task plans
- Sends end-of-day reminders
- Stores task plans in knowledge base

### 3. Proactive Knowledge Gathering
**File:** `proactive-knowledge-gathering.json`
**Schedule:** 3 times daily (10 AM, 2 PM, 6 PM)
**Purpose:**
- Researches AI trends and developments
- Monitors GitHub for new AI projects
- Scans Hacker News for AI content
- Builds your knowledge base automatically

## 🔧 Configuration Required

### API Keys Needed:
1. **Weather API:** Get free key from [OpenWeatherMap](https://openweathermap.org/api)
2. **News API:** Get free key from [NewsAPI](https://newsapi.org/)
3. **Email:** Configure your email provider (Gmail, Outlook, etc.)

### Setup Steps:
1. Replace `YOUR_WEATHER_API_KEY` in workflows
2. Replace `YOUR_NEWS_API_KEY` in workflows  
3. Replace `your-email@example.com` with your email
4. Configure email credentials in n8n

## 🏗️ Architecture Integration

```
Personal AI Copilot Architecture:
├── Frontend (Next.js) ✅
├── Backend API (Node.js) ✅  
├── AI Agents (CrewAI) ✅
├── Vector Database (PostgreSQL) ✅
└── Automation Layer (n8n) ← YOU ARE HERE
```

## 🔄 Workflow Triggers

- **Time-based:** Cron schedules for regular automation
- **Webhook:** HTTP endpoints for external triggers
- **Database:** Monitor changes in your data
- **Email:** Respond to incoming emails
- **API:** React to external service events

## 📊 Monitoring

- **n8n Dashboard:** View execution history and logs
- **Health Checks:** Built-in workflow monitoring
- **Email Notifications:** Get alerts on failures
- **Metrics:** Track automation performance

## 🛠️ Customization

### Adding New Workflows:
1. Create workflow in n8n visual editor
2. Export as JSON
3. Save to `./workflows/` directory
4. Document in this README

### Common Patterns:
- **Data Collection:** External APIs → RAG Storage
- **Notifications:** Conditions → Email/SMS alerts  
- **Processing:** AI Agents → Knowledge Updates
- **Scheduling:** Time triggers → Automated actions

## 🔒 Security

- Basic authentication enabled
- Environment variables for secrets
- Local Docker deployment
- No external data exposure

## 📈 Scaling

- Redis integration ready for queuing
- Webhook endpoints for external triggers
- Database integration with your main app
- Cloud deployment options available

## 🐛 Troubleshooting

### Common Issues:
1. **n8n won't start:** Check Docker is running
2. **Workflows fail:** Verify API keys are set
3. **No emails:** Check email credentials
4. **Backend unreachable:** Ensure backend is running on port 3001

### Debug Commands:
```bash
# Check n8n logs
docker-compose logs n8n

# Restart n8n
docker-compose restart n8n

# Stop all services
docker-compose down
```

## 🎯 Next Steps

After setting up n8n automation:
1. Import and configure all 3 workflows
2. Test each workflow manually first
3. Monitor for 24 hours to ensure stability
4. Customize schedules based on your preferences
5. Add additional workflows for your specific needs

Your Personal AI Copilot automation layer is now complete! 🎉
