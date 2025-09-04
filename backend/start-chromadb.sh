#!/bin/bash

# Start ChromaDB server
echo "🚀 Starting ChromaDB server..."

# Check if ChromaDB is installed
if ! command -v chroma &> /dev/null; then
    echo "⚠️ ChromaDB not found. Installing..."
    pip install chromadb
fi

# Start ChromaDB server on port 8000
echo "📊 Starting ChromaDB on http://localhost:8000"
chroma run --host localhost --port 8000 --path ./chromadb_data
