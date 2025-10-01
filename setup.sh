#!/bin/bash

# Setup script for Universal Language Learner

echo "🚀 Setting up Universal Language Learner..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local and add your OpenAI API key"
else
    echo "✅ .env.local already exists"
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
elif command -v pip &> /dev/null; then
    pip install -r requirements.txt
else
    echo "❌ Python pip not found. Please install Python and pip."
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.local and add your OpenAI API key"
echo "2. Start the Flask backend: python3 scripts/flask_api.py"
echo "3. Start the Next.js frontend: pnpm dev (or npm run dev)"
echo ""
echo "🌐 The app will be available at http://localhost:3000"