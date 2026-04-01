#!/bin/bash

# Local testing script for GitHub Actions workflows
# Run this to test workflows locally before pushing to GitHub

echo "🧪 Testing GitHub Actions workflows locally..."

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo "❌ 'act' is not installed. Install it first:"
    echo "   Windows: choco install act-cli"
    echo "   Mac: brew install act"
    echo "   Linux: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
    exit 1
fi

# Test CI workflow
echo ""
echo "🔍 Testing CI workflow..."
act -j test-backend -W .actrc --dry-run
echo ""
echo "🔍 Testing frontend CI..."
act -j test-frontend -W .actrc --dry-run

# Ask user if they want to run actual tests
echo ""
read -p "Run actual CI tests (not dry-run)? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Running CI workflow..."
    act -j test-backend -W .actrc
    act -j test-frontend -W .actrc
fi

# Test deployment workflow (dry run only for safety)
echo ""
echo "🔍 Testing deployment workflow (dry-run)..."
act -j ci-gate -W .actrc --dry-run
act -j health-check -W .actrc --dry-run
act -j deploy -W .actrc --dry-run

echo ""
echo "✅ Local testing completed!"
echo ""
echo "📋 Next steps:"
echo "1. Fix any issues found in dry-run"
echo "2. Run actual tests to verify functionality"
echo "3. Once everything passes, push to GitHub"
echo ""
echo "🔒 Safety reminder: Never push workflows that haven't passed local testing!"
