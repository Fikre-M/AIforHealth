# 🏠 Local Development Setup

This guide will help you set up the AI for Health platform for local development.

## 📋 Prerequisites

### Required Software
- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **MongoDB** v5.0 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/downloads))
- **Code Editor** (VS Code recommended)

### Optional Software
- **MongoDB Compass** (GUI for MongoDB)
- **Postman** (API testing)
- **Redis** (for caching - optional)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Fikre-M/AIforHealth.git
cd AIforHealth
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Minimum required configuration:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aiforhealth
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars
```

#### Start MongoDB
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

#### Start Backend Server
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

**Required configuration:**
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=AI for Health
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_NOTIFICATIONS=true
```

#### Start Frontend Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 Development Tools

### VS Code Extensions
Install these recommended extensions:
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Prettier - Code formatter**
- **ESLint**
- **MongoDB for VS Code**
- **Thunder Client** (API testing)

### VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## 🗄️ Database Setup

### MongoDB Local Setup

#### Create Database
```bash
# Connect to MongoDB
mongosh

# Create database and user
use aiforhealth
db.createUser({
  user: "aiforhealth",
  pwd: "password",
  roles: ["readWrite"]
})
```

#### Seed Database (Optional)
```bash
cd backend
npm run db:seed
```

### MongoDB Atlas (Cloud Alternative)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## 🧪 Testing Setup

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### End-to-End Testing
```bash
# Install Playwright (if not already installed)
npx playwright install

# Run E2E tests
npm run test:e2e
```

## 🔍 API Testing

### Using Thunder Client (VS Code)
1. Install Thunder Client extension
2. Import collection from `docs/api/thunder-client-collection.json`
3. Set environment variables:
   - `baseUrl`: `http://localhost:5000/api/v1`
   - `token`: (get from login response)

### Using Postman
1. Import collection from `docs/api/postman-collection.json`
2. Set up environment with base URL
3. Use authentication to get JWT token

## 📊 Development Monitoring

### Logs
Backend logs are available in:
- Console output
- `backend/logs/combined.log`
- `backend/logs/error.log`

### API Documentation
Access Swagger documentation at:
`http://localhost:5000/api-docs`

### Database Monitoring
Use MongoDB Compass to connect to:
`mongodb://localhost:27017/aiforhealth`

## 🔧 Common Development Tasks

### Database Operations
```bash
# Reset database
npm run db:reset

# Clear database
npm run db:clear

# Check database status
npm run db:status
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Build for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux
```

#### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

### Getting Help

1. Check the [Troubleshooting Guide](../troubleshooting/README.md)
2. Search [GitHub Issues](https://github.com/Fikre-M/AIforHealth/issues)
3. Create a new issue with:
   - Operating system
   - Node.js version
   - Error messages
   - Steps to reproduce

## 🎯 Next Steps

Once your local environment is running:

1. **Explore the API**: Use the Swagger documentation
2. **Test Authentication**: Register a new user and login
3. **Create Sample Data**: Use the seeding scripts
4. **Review Code**: Familiarize yourself with the codebase structure
5. **Read Documentation**: Check out the [Development Guide](../development/README.md)

## 📚 Additional Resources

- [Configuration Guide](../configuration/README.md)
- [API Documentation](../api/README.md)
- [Development Guidelines](../development/README.md)
- [Architecture Overview](../architecture/README.md)