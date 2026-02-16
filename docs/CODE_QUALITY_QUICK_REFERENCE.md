# Code Quality Quick Reference

Quick reference for developers working on AI for Health.

## Setup

```bash
# First time setup
bash scripts/setup-code-quality.sh  # Unix/Mac
powershell scripts/setup-code-quality.ps1  # Windows
```

## Daily Commands

```bash
# Before committing
npm run lint:fix      # Fix linting issues
npm run format        # Format code
npm run type-check    # Check types

# Run all checks
npm run validate      # Lint + Format + Type check + Tests
```

## Commit Messages

Format: `type(scope): subject`

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, semicolons)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes
- `revert`: Revert previous commit

### Examples
```bash
git commit -m "feat(auth): add JWT authentication"
git commit -m "fix(api): handle null user response"
git commit -m "docs(readme): update setup instructions"
git commit -m "refactor(utils): simplify date formatting"
git commit -m "test(auth): add login integration tests"
```

## Git Hooks

### Pre-commit
Automatically runs on `git commit`:
- Lints and formats staged files
- Checks for merge conflicts
- Validates file sizes

### Commit-msg
Validates commit message format

### Pre-push
Runs on `git push`:
- Type checking
- Tests
- Secret detection

### Bypass (Use with caution!)
```bash
git commit --no-verify  # Skip pre-commit
git push --no-verify    # Skip pre-push
```

## ESLint

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix

# Specific workspace
cd frontend && npm run lint
cd backend && npm run lint
```

### Common Issues

#### Unused variables
```typescript
// ❌ Bad
const unused = 'value';

// ✅ Good - prefix with underscore if intentionally unused
const _unused = 'value';
```

#### Missing return types
```typescript
// ❌ Bad
function getData() {
  return data;
}

// ✅ Good
function getData(): Data {
  return data;
}
```

#### Any type
```typescript
// ❌ Bad
function process(data: any) {}

// ✅ Good
function process(data: unknown) {
  if (typeof data === 'string') {
    // Type narrowing
  }
}
```

## Prettier

```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# Format specific files
npx prettier --write src/components/Button.tsx
```

### Configuration
- Single quotes
- Semicolons
- 2 spaces indentation
- 100 character line width
- Trailing commas (ES5)

## TypeScript

```bash
# Type check all workspaces
npm run type-check

# Type check specific workspace
cd frontend && npm run type-check
cd backend && npm run type-check
```

### Common Type Issues

#### Implicit any
```typescript
// ❌ Bad
function process(data) {}

// ✅ Good
function process(data: Data) {}
```

#### Null/undefined handling
```typescript
// ❌ Bad
const name = user.name;

// ✅ Good
const name = user?.name ?? 'Unknown';
```

#### Type assertions
```typescript
// ❌ Bad
const element = document.getElementById('id') as HTMLElement;

// ✅ Good
const element = document.getElementById('id');
if (element) {
  // Use element safely
}
```

## CI/CD

### Workflows

#### Code Quality (`code-quality.yml`)
Runs on every PR:
- Prettier check
- ESLint (frontend & backend)
- TypeScript check
- Dependency audit
- Console.log detection

#### CI (`ci.yml`)
Comprehensive testing:
- Code quality
- Security scanning
- Unit tests
- Integration tests
- E2E tests
- Build verification

### Viewing Results
1. Go to GitHub Actions tab
2. Select workflow run
3. Review failed jobs
4. Fix issues locally
5. Push changes

## Dependabot

### Auto-updates
- Weekly on Mondays
- Grouped by ecosystem
- Security updates separate

### Reviewing PRs
1. Check changelog
2. Review diff
3. Ensure CI passes
4. Test locally if needed
5. Merge

## Troubleshooting

### Husky hooks not running
```bash
rm -rf .husky
npm run prepare
chmod +x .husky/*  # Unix/Mac only
```

### ESLint cache issues
```bash
rm -rf node_modules/.cache/eslint
npm run lint
```

### Prettier conflicts
```bash
npm run lint:fix
npm run format
```

### Type errors after update
```bash
rm -rf node_modules
npm install
npm run type-check
```

### Pre-commit hook fails
```bash
# Check what's failing
git commit -v

# Fix issues
npm run lint:fix
npm run format

# Try again
git commit
```

## Best Practices

### Before Committing
1. Run `npm run validate`
2. Review your changes
3. Write clear commit message
4. Ensure tests pass

### Before Pushing
1. Pull latest changes
2. Resolve conflicts
3. Run tests
4. Push

### Code Review
1. Check CI status
2. Review code changes
3. Test locally if needed
4. Provide constructive feedback
5. Approve when ready

## Resources

- [Full Documentation](CODE_QUALITY.md)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Getting Help

1. Check documentation
2. Search existing issues
3. Ask in team chat
4. Create new issue with details
