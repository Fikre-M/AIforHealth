# Testing Quick Reference

Quick commands and patterns for testing in AI for Health.

## Commands

### Frontend
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:ui          # Visual UI
npm run test:coverage    # With coverage
npm run test:e2e         # E2E tests
npm run test:e2e:ui      # E2E with UI
```

### Backend
```bash
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
```

## Component Testing Patterns

### Basic Component
```typescript
import { render, screen } from '@/test/test-utils';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### User Interactions
```typescript
import userEvent from '@testing-library/user-event';

test('handles click', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();
  
  render(<Button onClick={handleClick}>Click</Button>);
  await user.click(screen.getByText('Click'));
  
  expect(handleClick).toHaveBeenCalled();
});
```

### Form Testing
```typescript
test('submits form', async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();
  
  render(<Form onSubmit={handleSubmit} />);
  
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(handleSubmit).toHaveBeenCalled();
});
```

### Async Operations
```typescript
import { waitFor } from '@testing-library/react';

test('loads data', async () => {
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

## API Testing Patterns

### GET Request
```typescript
test('GET /api/users', async () => {
  const response = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
    
  expect(response.body.data).toHaveLength(1);
});
```

### POST Request
```typescript
test('POST /api/users', async () => {
  const userData = {
    email: 'test@example.com',
    name: 'Test User',
  };
  
  const response = await request(app)
    .post('/api/users')
    .send(userData)
    .expect(201);
    
  expect(response.body.data.email).toBe(userData.email);
});
```

### Error Handling
```typescript
test('returns 404 for non-existent resource', async () => {
  await request(app)
    .get('/api/users/invalid-id')
    .expect(404);
});
```

## E2E Testing Patterns

### Navigation
```typescript
test('navigates to page', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Login');
  await expect(page).toHaveURL(/.*login/);
});
```

### Form Submission
```typescript
test('submits form', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*dashboard/);
});
```

### Waiting for Elements
```typescript
test('waits for element', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="content"]');
  await expect(page.locator('[data-testid="content"]')).toBeVisible();
});
```

## Common Queries

### React Testing Library
```typescript
// By role (preferred)
screen.getByRole('button', { name: /submit/i })

// By label text
screen.getByLabelText('Email')

// By placeholder
screen.getByPlaceholderText('Enter email')

// By text
screen.getByText('Hello World')

// By test ID (last resort)
screen.getByTestId('submit-button')
```

### Playwright
```typescript
// By text
page.locator('text=Login')

// By role
page.getByRole('button', { name: 'Submit' })

// By test ID
page.locator('[data-testid="submit-button"]')

// By CSS selector
page.locator('.submit-button')
```

## Assertions

### Jest/Vitest
```typescript
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(array).toContain(item)
expect(array).toHaveLength(3)
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledWith(arg)
expect(fn).toHaveBeenCalledTimes(2)
```

### Testing Library
```typescript
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toBeDisabled()
expect(element).toHaveTextContent('text')
expect(element).toHaveAttribute('href', '/path')
expect(element).toHaveClass('active')
```

### Playwright
```typescript
await expect(page).toHaveURL(/.*login/)
await expect(page).toHaveTitle(/Login/)
await expect(locator).toBeVisible()
await expect(locator).toBeDisabled()
await expect(locator).toHaveText('text')
await expect(locator).toHaveAttribute('href', '/path')
```

## Mocking

### Functions
```typescript
const mockFn = vi.fn()
mockFn.mockReturnValue('value')
mockFn.mockResolvedValue('async value')
mockFn.mockRejectedValue(new Error('error'))
```

### Modules
```typescript
vi.mock('@/services/api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'John' })
}))
```

### API with MSW
```typescript
import { http, HttpResponse } from 'msw';

http.get('/api/users', () => {
  return HttpResponse.json({ users: [] })
})
```

## Coverage

### View Coverage
```bash
# Frontend
npm run test:coverage
open coverage/index.html

# Backend
npm run test:coverage
open coverage/lcov-report/index.html
```

### Coverage Thresholds
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## Debugging

### Vitest
```typescript
// Use console.log
console.log(screen.debug())

// Use breakpoints
debugger;

// Run single test
test.only('my test', () => {})
```

### Playwright
```bash
# Debug mode
npm run test:e2e:debug

# UI mode
npm run test:e2e:ui

# Show report
npm run test:e2e:report
```

## Tips

1. **Use descriptive test names**
   ```typescript
   // ❌ Bad
   test('test 1', () => {})
   
   // ✅ Good
   test('should display error when email is invalid', () => {})
   ```

2. **Test user behavior, not implementation**
   ```typescript
   // ❌ Bad
   expect(component.state.count).toBe(1)
   
   // ✅ Good
   expect(screen.getByText('Count: 1')).toBeInTheDocument()
   ```

3. **Use accessible queries**
   ```typescript
   // ❌ Bad
   screen.getByTestId('submit-button')
   
   // ✅ Good
   screen.getByRole('button', { name: /submit/i })
   ```

4. **Keep tests independent**
   ```typescript
   // Each test should set up its own data
   beforeEach(() => {
     // Setup
   })
   
   afterEach(() => {
     // Cleanup
   })
   ```

5. **Test edge cases**
   - Empty states
   - Loading states
   - Error states
   - Boundary values

## Resources

- [Full Testing Guide](TESTING.md)
- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Docs](https://playwright.dev/)
