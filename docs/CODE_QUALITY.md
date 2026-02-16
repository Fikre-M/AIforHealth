# Code Quality Standards

This document outlines the code quality practices, tools, and standards for the AI for Health project.

## Overview

We enforce code quality through:
- Automated linting (ESLint)
- Code formatting (Prettier)
- Type checking (TypeScript)
- Pre-commit hooks (Husky)
- Continuous Integration (GitHub Actions)
- Dependency management (Dependabot)

## Tools & Configuration

### ESLint

ESLint enforces code quality and catches potential bugs.

#### Frontend Configuration
- Based on `@eslint/js` and `typescript-eslint`
- React-specific rules with `eslint-plugin-react-hooks`
- React Refresh plugin for HMR

#### Backend Configuration
- TypeScript strict rules
- Security plugin for vulnerability detection
- Node.js environment rules

#### Running ESLint

```bash
# Frontend
cd frontend
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues

# Backend
cd backend
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues

# All workspaces
npm run lint          # Check all
npm run lint:fix      # Fix all
```

### Prettier

Prettier ensures consistent code formatting across the project.

#### Configuration (`.prettierrc.json`)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

#### Running Prettier

```bash
# Format all files
npm run format

# Check formatting without changes
npm run format:check

# Format specific workspace
cd frontend
npm run format
```

### TypeScript

TypeScript provides static type checking to catch errors early.

#### Running Type Checks

```bash
# Frontend
cd frontend
npm run type-check

# Backend
cd backend
npm run type-check

# All workspaces
npm run type-check
```

## Pre-commit Hooks (Husky)

Husky runs automated checks before commits and pushes to ensure code quality.

### Setup

```bash
# Install Husky (done automatically on npm install)
npm install

# Husky will be installed and hooks configured
```

### Pre-commit Hook

Runs before every commit:
- Lints and formats staged files (lint-staged)
- Checks for merge conflict markers
- Validates file sizes (max 5MB)

### Commit Message Hook

Validates commit message format (Conventional Commits):

```
type(scope): subject

Types: feat, fix, docs, style, refactor, perf, test, chore, build, ci, revert
```

Examples:
```bash
git commit -m "feat(auth): add login functionality"
git commit -m "fix(api): resolve user endpoint error"
git commit -m "docs(readme): update installation instructions"
```

### Pre-push Hook

Runs before pushing to remote:
- Type checking across all workspaces
- Runs test suites
- Checks for potential secrets in code

### Bypassing Hooks (Not Recommended)

```bash
# Skip pre-commit hooks (use with caution)
git commit --no-verify

# Skip pre-push hooks (use with caution)
git push --no-verify
```

## Continuous Integration

### GitHub Actions Workflows

#### Code Quality Workflow (`.github/workflows/code-quality.yml`)

Runs on every PR and push to main/develop:
- Prettier formatting check
- ESLint for frontend and backend
- TypeScript type checking
- Dependency audit
- Code complexity analysis
- TODO/FIXME comment check
- Console.log statement check

#### CI Workflow (`.github/workflows/ci.yml`)

Comprehensive testing and validation:
- Code quality checks
- Security scanning (CodeQL, Snyk)
- Unit tests
- Integration tests
- E2E tests
- Build verification
- Performance tests

### Viewing CI Results

1. Go to the "Actions" tab in GitHub
2. Select the workflow run
3. Review job results and logs
4. Fix any failing checks

## Dependency Management

### Dependabot

Automatically creates PRs for dependency updates.

#### Configuration (`.github/dependabot.yml`)
- Weekly updates on Mondays
- Separate PRs for frontend, backend, and root dependencies
- Grouped updates for related packages
- Security updates always separate

#### Reviewing Dependabot PRs

1. Check the changelog for breaking changes
2. Review the diff for unexpected changes
3. Ensure CI passes
4. Test locally if needed
5. Merge when confident

### Manual Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all packages (use with caution)
npm update

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

## Code Review Checklist

Before submitting a PR, ensure:

### Code Quality
- [ ] ESLint passes with no errors
- [ ] Prettier formatting applied
- [ ] TypeScript type checking passes
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] No TODO/FIXME without issue reference

### Security
- [ ] No hardcoded secrets or credentials
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive info
- [ ] Dependencies have no known vulnerabilities

### Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)
- [ ] Test coverage maintained or improved

### Documentation
- [ ] Code comments for complex logic
- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] CHANGELOG updated

### Performance
- [ ] No unnecessary re-renders (React)
- [ ] Efficient database queries
- [ ] Proper error handling
- [ ] No memory leaks

## Best Practices

### Code Style

#### Naming Conventions
```typescript
// PascalCase for components and classes
class UserService {}
const UserProfile = () => {};

// camelCase for variables and functions
const userName = 'John';
function getUserData() {}

// UPPER_SNAKE_CASE for constants
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// kebab-case for file names
user-profile.tsx
api-service.ts
```

#### File Organization
```
src/
├── components/       # Reusable UI components
├── features/         # Feature-based modules
├── hooks/           # Custom React hooks
├── services/        # API and external services
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── config/          # Configuration files
```

#### Import Order
```typescript
// 1. External libraries
import React from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal modules (absolute imports)
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

// 3. Relative imports
import { UserProfile } from './UserProfile';
import styles from './styles.module.css';
```

### TypeScript Best Practices

```typescript
// Use explicit types for function parameters and return values
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type for unions and intersections
type Status = 'pending' | 'approved' | 'rejected';
type UserWithStatus = User & { status: Status };

// Avoid 'any' - use 'unknown' if type is truly unknown
function processData(data: unknown) {
  if (typeof data === 'string') {
    // Type narrowing
    return data.toUpperCase();
  }
}
```

### React Best Practices

```typescript
// Use functional components with hooks
const UserProfile: React.FC<Props> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  return <div>{user?.name}</div>;
};

// Extract complex logic to custom hooks
const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading };
};

// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Use callback for event handlers
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

### Error Handling

```typescript
// Backend - Use try-catch with proper error logging
try {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
} catch (error) {
  logError('Failed to fetch user', error, { userId });
  throw error;
}

// Frontend - Use error boundaries for React
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError('React error boundary', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Troubleshooting

### ESLint Issues

```bash
# Clear ESLint cache
rm -rf node_modules/.cache/eslint

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Prettier Conflicts with ESLint

Prettier is configured to work with ESLint. If conflicts occur:
1. Ensure `eslint-config-prettier` is installed
2. Check that Prettier runs after ESLint in lint-staged
3. Run `npm run lint:fix` then `npm run format`

### Husky Hooks Not Running

```bash
# Reinstall Husky
rm -rf .husky
npm run prepare

# Make hooks executable (Unix/Mac)
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

### Type Checking Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache/typescript

# Rebuild
npm run build
```

## Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Getting Help

If you encounter issues with code quality tools:
1. Check this documentation
2. Review the tool's official documentation
3. Search existing GitHub issues
4. Ask in the team chat
5. Create a new issue with details
