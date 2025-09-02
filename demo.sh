#!/bin/bash

# AI Copilot Demo Script
# This script demonstrates the full functionality of the Personal AI Copilot

API_URL="http://localhost:3001"

echo "🚀 Personal AI Copilot Demo"
echo "=============================="
echo ""

echo "1. 📊 Checking System Health..."
curl -s $API_URL/health | jq '.'
echo ""

echo "2. 📝 Current Tasks:"
curl -s $API_URL/api/tasks | jq '.data[] | {id, title, priority, status}'
echo ""

echo "3. 🤖 AI Chat - Asking about productivity..."
curl -s -X POST $API_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Give me 3 productivity tips for software developers", "userId": 1}' | \
  jq '.data.response'
echo ""

echo "4. 📅 Generating Daily Briefing..."
curl -s -X POST $API_URL/api/briefing/generate \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}' | \
  jq '.data.briefing' | head -20
echo ""

echo "5. ✅ Creating a new task..."
curl -s -X POST $API_URL/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Demo: Review AI Copilot features", "description": "Test all functionality and prepare presentation", "priority": "high"}' | \
  jq '.data | {id, title, priority}'
echo ""

echo "6. 🔔 Recent Notifications:"
curl -s $API_URL/api/notifications | jq '.data[0:3] | .[] | {title, message, type}'
echo ""

echo "✅ Demo Complete! Visit http://localhost:3000 to see the dashboard."
