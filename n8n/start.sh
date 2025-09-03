#!/bin/bash

echo "🚀 Starting Personal AI Copilot n8n Automation Layer..."

# Create required directories
mkdir -p n8n_data
mkdir -p n8n_data/workflows
mkdir -p n8n_data/credentials

# Set permissions
chmod 755 n8n_data

# Start n8n with Docker Compose
echo "📦 Starting n8n container..."
docker-compose up -d

# Wait for n8n to be ready
echo "⏳ Waiting for n8n to be ready..."
sleep 15

# Check if n8n is running
if curl -f http://localhost:5678 > /dev/null 2>&1; then
    echo "✅ n8n is running at http://localhost:5678"
    echo "📧 Login with:"
    echo "   Username: admin"
    echo "   Password: password123"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Open http://localhost:5678 in your browser"
    echo "2. Import the workflow files from ./workflows/"
    echo "3. Configure your API keys:"
    echo "   - Weather API (OpenWeatherMap)"
    echo "   - News API"
    echo "   - Email credentials"
    echo "4. Activate the workflows"
    echo ""
    echo "📋 Available workflows:"
    echo "   - Daily Briefing Automation (runs at 8 AM)"
    echo "   - Smart Task Management (runs every 4 hours)"
    echo "   - Proactive Knowledge Gathering (runs 3x daily)"
else
    echo "❌ n8n failed to start. Check Docker logs:"
    echo "docker-compose logs n8n"
fi
