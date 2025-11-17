#!/bin/bash
# Deployment script for Book Review Tracker
# This script builds the frontend and copies it to the docs folder for GitHub Pages

set -e  # Exit on error

echo "🔨 Building frontend..."
cd src/frontend
npm run build

echo "🧹 Cleaning old deployment..."
cd ../..
rm -rf docs/assets/*
rm -f docs/index.html

echo "📦 Copying new build to docs..."
cp -r src/frontend/dist/* docs/

echo "✅ Deployment ready!"
echo ""
echo "Next steps:"
echo "1. Review changes: git status"
echo "2. Commit: git add docs/ && git commit -m 'Deploy latest build'"
echo "3. Push: git push"
echo ""
echo "🌐 Your app will be live at: https://zaydiscold.github.io/book-review-tracker/"
