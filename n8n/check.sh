#!/bin/bash

echo "🔍 Personal AI Copilot - System Check"
echo "=================================="

# Check if Docker is running
echo "📦 Checking Docker..."
if command -v docker &> /dev/null && docker info > /dev/null 2>&1; then
    echo "✅ Docker is running"
else
    echo "❌ Docker is not running or not installed"
    echo "   Please install Docker and ensure it's running"
    exit 1
fi

# Check if backend is running
echo "🔧 Checking Backend API..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend API is running on port 3001"
else
    echo "❌ Backend API is not running"
    echo "   Please start the backend server first"
    echo "   cd ../backend && npm start"
fi

# Check if frontend is running  
echo "🎨 Checking Frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running on port 3000"
else
    echo "⚠️  Frontend is not running (optional for n8n)"
    echo "   To start: cd ../frontend && npm run dev"
fi

# Check workflow files
echo "📋 Checking Workflows..."
workflow_count=$(ls workflows/*.json 2>/dev/null | wc -l)
if [ $workflow_count -eq 3 ]; then
    echo "✅ All 3 workflow files found"
    echo "   - Daily Briefing Automation"
    echo "   - Smart Task Management" 
    echo "   - Proactive Knowledge Gathering"
else
    echo "❌ Missing workflow files ($workflow_count found, expected 3)"
fi

# Check if n8n is already running
echo "🤖 Checking n8n..."
if curl -f http://localhost:5678 > /dev/null 2>&1; then
    echo "✅ n8n is already running on port 5678"
else
    echo "ℹ️  n8n is not running (ready to start)"
fi

echo ""
echo "🚀 Ready to start n8n automation!"
echo "Run: ./start.sh"
