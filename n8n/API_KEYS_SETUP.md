# API Keys Setup Guide

To make your n8n automation workflows work properly, you'll need to obtain API keys from these services:

## 🌤️ Weather API (OpenWeatherMap)

1. **Go to:** https://openweathermap.org/api
2. **Sign up** for a free account
3. **Get your API key** from the dashboard
4. **Update:** `credentials/weather-api.json` - replace `YOUR_OPENWEATHERMAP_API_KEY_HERE`

**Free Plan:** 1,000 calls/day (perfect for personal use)

## 📰 News API

1. **Go to:** https://newsapi.org/
2. **Sign up** for a free account  
3. **Get your API key** from the dashboard
4. **Update:** `credentials/news-api.json` - replace `YOUR_NEWS_API_KEY_HERE`

**Free Plan:** 100 requests/day (perfect for daily briefings)

## 📧 Email SMTP (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update:** `credentials/email-smtp.json`
   - Replace `your-email@gmail.com` with your Gmail
   - Replace `your-app-password` with the generated app password

## 🔧 Alternative SMTP Providers

### Outlook/Hotmail:
```json
{
  "host": "smtp.live.com",
  "port": 587,
  "user": "your-email@outlook.com",
  "password": "your-password"
}
```

### Yahoo:
```json
{
  "host": "smtp.mail.yahoo.com", 
  "port": 587,
  "user": "your-email@yahoo.com",
  "password": "your-app-password"
}
```

## 🚀 After Getting API Keys:

1. **Update the credential files** with your actual API keys
2. **Restart n8n:** `docker-compose restart n8n`
3. **Import workflows** in the n8n interface
4. **Activate workflows** and test them

## 💡 Testing Your Setup:

- **Weather API:** Test with `https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY`
- **News API:** Test with `https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_API_KEY`
- **Email:** Send a test email through n8n

Your automation workflows will be fully functional once these are configured! 🎉
