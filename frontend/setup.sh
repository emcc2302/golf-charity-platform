#!/bin/bash
echo "═══════════════════════════════════════════"
echo "  GolfGives Frontend Setup"
echo "═══════════════════════════════════════════"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ .env created"
else
  echo "⏭️  .env already exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "═══════════════════════════════════════════"
echo "✅ Ready! Run: npm start"
echo "═══════════════════════════════════════════"
