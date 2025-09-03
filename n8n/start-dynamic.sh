#!/bin/bash

# Dynamic IP Configuration Script for n8n
# This script automatically detects your IP and updates workflows

echo "🔍 Detecting local IP address..."

# Get the active IP address (Windows)
if command -v ipconfig &> /dev/null; then
    LOCAL_IP=$(ipconfig | grep -E "IPv4.*192\.|IPv4.*10\.|IPv4.*172\." | head -1 | awk '{print $14}')
fi

# Fallback to localhost if no IP detected
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi

echo "📍 Using IP: $LOCAL_IP"

# Update environment file
cat > .env << EOF
BACKEND_URL=http://$LOCAL_IP:3001
NEWS_API_KEY=3af5d44b978d41eeac63fb9d65016726
WEATHER_API_KEY=YOUR_OPENWEATHERMAP_API_KEY_HERE
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
DB_TYPE=sqlite
N8N_LOG_LEVEL=info
EOF

echo "✅ Configuration updated!"
echo "🚀 Starting n8n with dynamic configuration..."

# Restart n8n with new configuration
docker-compose down
docker-compose up -d

echo "🎉 n8n is ready at http://localhost:5678"
