# Code Quality Setup Script for Windows
# This script sets up all code quality tools for the AI for Health project

$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up code quality tools..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($versionNumber -lt 18) {
        Write-Host "❌ Node.js version 18 or higher is required. Current version: $nodeVersion" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Blue
npm install
Write-Host "✅ Root dependencies installed" -ForegroundColor Green
Write-Host ""

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
Set-Location frontend
npm install
Set-Location ..
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
Set-Location backend
npm install
Set-Location ..
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Setup Husky
Write-Host "🐕 Setting up Husky git hooks..." -ForegroundColor Blue
npm run prepare
Write-Host "✅ Husky configured" -ForegroundColor Green
Write-Host ""

# Run initial formatting
Write-Host "💅 Running initial code formatting..." -ForegroundColor Blue
try {
    npm run format
} catch {
    Write-Host "⚠️ Some files could not be formatted" -ForegroundColor Yellow
}
Write-Host ""

# Run linting
Write-Host "🔍 Running ESLint checks..." -ForegroundColor Blue
try {
    npm run lint
} catch {
    Write-Host "⚠️ Some linting issues found. Run 'npm run lint:fix' to auto-fix" -ForegroundColor Yellow
}
Write-Host ""

# Run type checking
Write-Host "🏗️ Running TypeScript type checks..." -ForegroundColor Blue
try {
    npm run type-check
} catch {
    Write-Host "⚠️ Type checking found some issues" -ForegroundColor Yellow
}
Write-Host ""

# Check for security vulnerabilities
Write-Host "🔒 Running security audit..." -ForegroundColor Blue
Write-Host "Frontend:"
Set-Location frontend
try {
    npm audit --audit-level=moderate
} catch {
    Write-Host "⚠️ Some vulnerabilities found in frontend" -ForegroundColor Yellow
}
Set-Location ..
Write-Host ""

Write-Host "Backend:"
Set-Location backend
try {
    npm audit --audit-level=moderate
} catch {
    Write-Host "⚠️ Some vulnerabilities found in backend" -ForegroundColor Yellow
}
Set-Location ..
Write-Host ""

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Code quality tools setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Available commands:"
Write-Host ""
Write-Host "  npm run lint          - Check code with ESLint"
Write-Host "  npm run lint:fix      - Auto-fix ESLint issues"
Write-Host "  npm run format        - Format code with Prettier"
Write-Host "  npm run format:check  - Check code formatting"
Write-Host "  npm run type-check    - Run TypeScript type checking"
Write-Host "  npm run validate      - Run all checks"
Write-Host ""
Write-Host "Git hooks are now active:"
Write-Host "  - pre-commit: Runs linting and formatting on staged files"
Write-Host "  - commit-msg: Validates commit message format"
Write-Host "  - pre-push: Runs type checking and tests"
Write-Host ""
Write-Host "Commit message format (Conventional Commits):"
Write-Host "  type(scope): subject"
Write-Host ""
Write-Host "  Examples:"
Write-Host "    feat(auth): add login functionality"
Write-Host "    fix(api): resolve user endpoint error"
Write-Host "    docs(readme): update installation instructions"
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Blue
