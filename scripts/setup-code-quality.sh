#!/bin/bash

# Code Quality Setup Script
# This script sets up all code quality tools for the AI for Health project

set -e

echo "🚀 Setting up code quality tools..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"
echo ""

# Install root dependencies
echo -e "${BLUE}📦 Installing root dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Root dependencies installed${NC}"
echo ""

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm install
cd ..
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Setup Husky
echo -e "${BLUE}🐕 Setting up Husky git hooks...${NC}"
npm run prepare
echo -e "${GREEN}✅ Husky configured${NC}"
echo ""

# Make hooks executable (Unix/Mac only)
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
    echo -e "${BLUE}🔧 Making git hooks executable...${NC}"
    chmod +x .husky/pre-commit
    chmod +x .husky/commit-msg
    chmod +x .husky/pre-push
    echo -e "${GREEN}✅ Git hooks are executable${NC}"
    echo ""
fi

# Run initial formatting
echo -e "${BLUE}💅 Running initial code formatting...${NC}"
npm run format || echo -e "${YELLOW}⚠️ Some files could not be formatted${NC}"
echo ""

# Run linting
echo -e "${BLUE}🔍 Running ESLint checks...${NC}"
npm run lint || echo -e "${YELLOW}⚠️ Some linting issues found. Run 'npm run lint:fix' to auto-fix${NC}"
echo ""

# Run type checking
echo -e "${BLUE}🏗️ Running TypeScript type checks...${NC}"
npm run type-check || echo -e "${YELLOW}⚠️ Type checking found some issues${NC}"
echo ""

# Check for security vulnerabilities
echo -e "${BLUE}🔒 Running security audit...${NC}"
echo "Frontend:"
cd frontend
npm audit --audit-level=moderate || echo -e "${YELLOW}⚠️ Some vulnerabilities found in frontend${NC}"
cd ..
echo ""
echo "Backend:"
cd backend
npm audit --audit-level=moderate || echo -e "${YELLOW}⚠️ Some vulnerabilities found in backend${NC}"
cd ..
echo ""

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Code quality tools setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Available commands:"
echo ""
echo "  npm run lint          - Check code with ESLint"
echo "  npm run lint:fix      - Auto-fix ESLint issues"
echo "  npm run format        - Format code with Prettier"
echo "  npm run format:check  - Check code formatting"
echo "  npm run type-check    - Run TypeScript type checking"
echo "  npm run validate      - Run all checks"
echo ""
echo "Git hooks are now active:"
echo "  - pre-commit: Runs linting and formatting on staged files"
echo "  - commit-msg: Validates commit message format"
echo "  - pre-push: Runs type checking and tests"
echo ""
echo "Commit message format (Conventional Commits):"
echo "  type(scope): subject"
echo ""
echo "  Examples:"
echo "    feat(auth): add login functionality"
echo "    fix(api): resolve user endpoint error"
echo "    docs(readme): update installation instructions"
echo ""
echo -e "${BLUE}Happy coding! 🎉${NC}"
