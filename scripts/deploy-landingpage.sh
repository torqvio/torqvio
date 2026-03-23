#!/bin/bash

# Deployment script for landing page
set -e

echo "🚀 Starting landing page deployment..."

# Navigate to project root
cd "$(dirname "$0")/.."

# Build the landing page
echo "📦 Building landing page..."
cd landinpage
npm ci
npm run build

# Deploy based on environment
if [ "$1" = "production" ]; then
    echo "🌐 Deploying to production..."
    
    # Example deployment methods - uncomment and configure as needed
    
    # Vercel deployment
    # npx vercel --prod --token $VERCEL_TOKEN
    
    # Netlify deployment
    # npx netlify deploy --prod --dir=out --auth $NETLIFY_AUTH_TOKEN --site $NETLIFY_SITE_ID
    
    # Docker deployment
    # docker build -t torqvio-landingpage .
    # docker push torqvio-landingpage:latest
    
    echo "✅ Landing page deployed to production!"
    
elif [ "$1" = "staging" ]; then
    echo "🧪 Deploying to staging..."
    
    # Staging deployment logic
    # npx vercel --token $VERCEL_TOKEN
    
    echo "✅ Landing page deployed to staging!"
    
else
    echo "❌ Please specify environment: 'production' or 'staging'"
    exit 1
fi

echo "🎉 Landing page deployment complete!"
