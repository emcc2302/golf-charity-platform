#!/bin/bash
echo "═══════════════════════════════════════════"
echo "  GolfGives Backend Setup"
echo "═══════════════════════════════════════════"

# 1. Copy .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ .env created from .env.example"
else
  echo "⏭️  .env already exists — skipping copy"
fi

# 2. Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# 3. Run seeder
echo ""
echo "🌱 Seeding database..."
node utils/seeder.js

echo ""
echo "═══════════════════════════════════════════"
echo "✅ Setup complete! Run: npm run dev"
echo "═══════════════════════════════════════════"
