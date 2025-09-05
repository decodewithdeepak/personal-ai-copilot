# 🔑 API Keys Setup Guide

This guide walks you through getting **all the API keys** needed for your Personal AI Copilot system.

## 🎯 Quick Overview

**Required for basic functionality (4 keys):**

- ✅ Google Gemini AI - Core AI functionality
- ✅ WeatherAPI - Weather data
- ✅ NewsAPI - News updates
- ✅ NeonDB - Database connection

**Optional for integrations (6+ keys):**

- 🔗 Slack, Discord, GitHub, Email, Telegram, WhatsApp

---

## 🚀 REQUIRED API Keys (Get These First)

### 1. Google Gemini AI API Key ⭐

**Purpose:** Core AI functionality, chat responses, task planning

**How to get it:**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIzaSy...`)

**Add to .env:**

```bash
GEMINI_API_KEY=AIz.....
```

**Cost:** Free tier: 60 requests/minute, paid plans available

---

### 2. WeatherAPI Key 🌤️

**Purpose:** Weather data for daily briefings

**How to get it:**

1. Go to [WeatherAPI.com](https://www.weatherapi.com/signup.aspx)
2. Sign up for free account
3. Verify your email
4. Go to dashboard → API Keys
5. Copy your API key

**Add to .env:**

```bash
WEATHER_API_KEY=721249...............
```

**Cost:** Free tier: 1M calls/month

---

### 3. NewsAPI Key 📰

**Purpose:** News updates for daily briefings

**How to get it:**

1. Go to [NewsAPI.org](https://newsapi.org/register)
2. Sign up for free developer account
3. Verify your email
4. Go to account → API Keys
5. Copy your API key

**Add to .env:**

```bash
NEWS_API_KEY=3af5d.................
```

**Cost:** Free tier: 1000 requests/day

---

### 4. NeonDB PostgreSQL 🗄️

**Purpose:** Main database for storing tasks, users, conversations

**How to get it:**

1. Go to [Neon.tech](https://neon.tech/)
2. Sign up with GitHub or email
3. Create new project
4. Go to Dashboard → Connection Details
5. Copy the connection string

**Add to .env:**

```bash
DATABASE_URL=postgresql://neondb_owner:your_password@ep-..........
```

**Cost:** Free tier: 512MB storage, paid plans available

---

## 🔗 OPTIONAL Integration Keys

### 5. Slack Bot Token 💬

**Purpose:** Send notifications to Slack channels

**How to get it:**

1. Go to [Slack API](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "AI Copilot")
4. Select your workspace
5. Go to "OAuth & Permissions"
6. Add bot scopes: `chat:write`, `channels:read`
7. Install app to workspace
8. Copy "Bot User OAuth Token"

**Add to .env:**

```bash
SLACK_BOT_TOKEN=xoxb-...............
```

---

### 6. Discord Webhook 🎮

**Purpose:** Send notifications to Discord channels

**How to get it:**

1. Open Discord → Go to your server
2. Right-click channel → "Edit Channel"
3. Go to "Integrations" → "Webhooks"
4. Click "New Webhook"
5. Name it "AI Copilot"
6. Copy webhook URL

**Add to .env:**

```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/123..................
```

---

### 7. GitHub Personal Access Token 🐱

**Purpose:** Create issues, manage repositories

**How to get it:**

1. Go to [GitHub Settings](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Name: "AI Copilot"
4. Select scopes: `repo`, `issues`, `notifications`
5. Generate and copy token

**Add to .env:**

```bash
GITHUB_TOKEN=ghp_12345..............
GITHUB_REPO=personal-ai-copilot
```

---

### 8. Email (Gmail App Password) 📧

**Purpose:** Send email notifications

**How to get it:**

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication (required)
3. Go to "App passwords"
4. Generate password for "Mail"
5. Copy 16-character password

**Add to .env:**

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
EMAIL_FROM=your-email@gmail.com
```

---

### 9. Telegram Bot Token 🤖

**Purpose:** Send notifications via Telegram

**How to get it:**

1. Open Telegram → Search for `@BotFather`
2. Send `/newbot`
3. Choose bot name (e.g., "AI Copilot Bot")
4. Choose username (e.g., "your_ai_copilot_bot")
5. Copy bot token
6. Get your chat ID: Send message to bot, visit `https://api.telegram.org/bot<TOKEN>/getUpdates`

**Add to .env:**

```bash
TELEGRAM_BOT_TOKEN=123456789:ABC...
TELEGRAM_CHAT_ID=123456789...
```

---

### 10. WhatsApp (Twilio) 📱

**Purpose:** Send WhatsApp notifications

**How to get it:**

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for account
3. Get Account SID and Auth Token
4. Go to WhatsApp Sandbox
5. Follow setup instructions

**Add to .env:**

```bash
TWILIO_ACCOUNT_SID=AC12345...........
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
WHATSAPP_TO=whatsapp:+1234567890
```

---

## 📋 Setup Checklist

### ✅ Required (Core Functionality)

- [ ] Google Gemini AI API Key
- [ ] WeatherAPI Key
- [ ] NewsAPI Key
- [ ] NeonDB Connection String

### 🔗 Optional (Integrations)

- [ ] Slack Bot Token
- [ ] Discord Webhook URL
- [ ] GitHub Personal Access Token
- [ ] Gmail App Password
- [ ] Telegram Bot Token
- [ ] Twilio WhatsApp API

---

## 🚨 Security Best Practices

### ✅ DO:

- Keep API keys in `.env` file (never commit to git)
- Use environment-specific keys (dev vs prod)
- Rotate keys periodically
- Use least-privilege permissions
- Store backup keys securely

### ❌ DON'T:

- Hardcode keys in source code
- Share keys in public channels
- Use production keys in development
- Commit `.env` files to version control

---

## 🛠️ Testing Your Keys

Once you have the keys, test them:

```bash
# Test core APIs
cd backend
node test-gemini.js     # Test Gemini AI
node test-weather.js    # Test WeatherAPI
node test-news.js       # Test NewsAPI

# Test database
npm run test:db

# Test integrations
npm run test:integrations
```

---

## 💰 Cost Estimates

| Service          | Free Tier    | Typical Monthly Cost |
| ---------------- | ------------ | -------------------- |
| Google Gemini AI | 60 req/min   | $0-10                |
| WeatherAPI       | 1M calls     | $0                   |
| NewsAPI          | 1000 req/day | $0                   |
| NeonDB           | 512MB        | $0                   |
| Slack            | Unlimited    | $0                   |
| Discord          | Unlimited    | $0                   |
| GitHub           | Public repos | $0                   |
| Gmail            | Personal use | $0                   |
| Telegram         | Unlimited    | $0                   |
| Twilio           | $15 credit   | $5-15                |

**Total estimated cost: $0-25/month** (mostly free!)

---

## 🆘 Troubleshooting

### Common Issues:

**"Invalid API Key" Error:**

- Double-check the key in `.env` file
- Ensure no extra spaces or quotes
- Verify key is active in the service dashboard

**"Rate Limit Exceeded":**

- Check your usage in service dashboard
- Upgrade to paid plan if needed
- Implement rate limiting in code

**"CORS Error":**

- Verify `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` settings
- Check firewall settings

**"Database Connection Error":**

- Verify `DATABASE_URL` format
- Check NeonDB dashboard for connection details
- Ensure `?sslmode=require` is included

---

## 🎯 Quick Start Commands

```bash
# 1. Copy template
cp .env.example .env

# 2. Edit with your keys
nano .env

# 3. Test everything
cd backend && npm run test:all

# 4. Start services
npm start                    # Backend
cd ../frontend && npm run dev # Frontend
cd ../n8n && docker-compose up # Automation
```

**You're all set!** 🚀 Your Personal AI Copilot now has all the keys it needs to work perfectly.
