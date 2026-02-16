# Testing Guide

Comprehensive testing guide for the AI for Health project.

## Overview

We use a multi-layered testing approach:
- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test how different parts work together
- **E2E Tests**: Test complete user workflows
- **Coverage**: Aim for >80% code coverage

## Testing Stack

### Frontend
- **Vitest**: Fast unit test runner (Vite-native)
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Playwright**: E2E testing
- **@vitest/coverage-v8**: Coverage reporting

### Backend
- **Jest**: Unit and integration testing
- **Supertest**: HTTP endpoint testing
- **MongoDB Memory Server**: In-memory database for tests
- **ts-jest**: TypeScript support for Jest

## Quick Start

```bash
# Frontend tests
cd frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # Visual UI
npm run test:coverage # With coverage

# Backend tests
cd backend
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:integration # Integration tests only
npm run test:watch    # Watch mode
npm run test:coverage # With coverage

# E2E tests
cd frontend
npm run test:e2e      # Run E2E tests
npm run test:e2e:ui   # Interactive UI
npm run test:e2e:debug # Debug mode
```

## Frontend Testing

### Unit Tests (Vitest + React Testing Library)

#### Test File Structure
```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts
└── utils/
    ├── formatDate.ts
    └── formatDate.test.ts
```

#### Component Testing Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

#### Hook Testing Example

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('returns user when authenticated', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });
  });

  it('handles login', async () => {
    const { result } = renderHook(() => useAuth());

    await result.current.login('test@example.com', 'password');

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
```

#### Utility Function Testing

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-03-20');
    expect(formatDate(date)).toBe('March 20, 2024');
  });

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid date');
  });
});
```

### API Mocking with MSW

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/users', () => {
    return HttpResponse.json({
      users: [{ id: 1, name: 'John' }],
    });
  }),

  http.post('/api/v1/login', async ({ request }) => {
    const { email, password } = await request.json();
    
    if (email === 'test@example.com' && password === 'password') {
      return HttpResponse.json({
        token: 'mock-token',
        user: { id: 1, email },
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),
];
```

### Test Utilities

```typescript
// src/test/test-utils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

## Backend Testing

### Unit Tests

#### Controller Testing

```typescript
import request from 'supertest';
import app from '@/app';
import { User } from '@/models/User';
import { generateTestToken } from '@/test/helpers';

describe('User Controller', () => {
  describe('GET /api/v1/users/:id', () => {
    it('returns user by id', async () => {
      const user = await User.create({
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
      });

      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get(`/api/v1/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.email).toBe('test@example.com');
    });

    it('returns 404 for non-existent user', async () => {
      const token = generateTestToken('123456789012345678901234');

      await request(app)
        .get('/api/v1/users/123456789012345678901234')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
```

#### Service Testing

```typescript
import { UserService } from '@/services/UserService';
import { User } from '@/models/User';

describe('UserService', () => {
  describe('createUser', () => {
    it('creates a new user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const user = await UserService.createUser(userData);

      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });

    it('throws error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      await UserService.createUser(userData);

      await expect(UserService.createUser(userData)).rejects.toThrow();
    });
  });
});
```

#### Middleware Testing

```typescript
import { authenticate } from '@/middleware/auth';
import { generateTestToken, mockRequest, mockResponse, mockNext } from '@/test/helpers';

describe('Auth Middleware', () => {
  it('authenticates valid token', async () => {
    const token = generateTestToken('123456789012345678901234');
    const req = mockRequest({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = mockResponse();
    const next = mockNext;

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  it('rejects invalid token', async () => {
    const req = mockRequest({
      headers: { authorization: 'Bearer invalid-token' },
    });
    const res = mockResponse();
    const next = mockNext;

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
```

### Integration Tests

```typescript
import request from 'supertest';
import app from '@/app';
import { User } from '@/models/User';
import { Appointment } from '@/models/Appointment';

describe('Appointment Flow', () => {
  it('creates and retrieves appointment', async () => {
    // Create user
    const user = await User.create({
      email: 'patient@example.com',
      name: 'Patient',
      password: 'hashedPassword',
      role: 'patient',
    });

    const token = generateTestToken(user._id.toString(), 'patient');

    // Create appointment
    const appointmentData = {
      doctorId: '123456789012345678901234',
      date: '2024-03-20',
      time: '10:00',
      reason: 'Checkup',
    };

    const createResponse = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send(appointmentData)
      .expect(201);

    const appointmentId = createResponse.body.data._id;

    // Retrieve appointment
    const getResponse = await request(app)
      .get(`/api/v1/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getResponse.body.data.reason).toBe(appointmentData.reason);
  });
});
```

## E2E Testing (Playwright)

### Test Structure

```
e2e/
├── auth/
│   ├── login.spec.ts
│   └── register.spec.ts
├── appointments/
│   ├── booking.spec.ts
│   └── management.spec.ts
└── fixtures/
    └── test-data.ts
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('Appointment Booking', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'patient@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('books an appointment', async ({ page }) => {
    // Navigate to booking page
    await page.click('text=Book Appointment');
    await expect(page).toHaveURL('**/appointments/book');

    // Select doctor
    await page.click('[data-testid="doctor-select"]');
    await page.click('text=Dr. Smith');

    // Select date and time
    await page.fill('input[type="date"]', '2024-03-20');
    await page.click('text=10:00 AM');

    // Fill reason
    await page.fill('textarea[name="reason"]', 'Regular checkup');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Appointment booked successfully')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/appointments/book');

    // Try to submit without filling fields
    await page.click('button[type="submit"]');

    // Check for validation errors
    await expect(page.locator('text=Doctor is required')).toBeVisible();
    await expect(page.locator('text=Date is required')).toBeVisible();
  });
});
```

### Page Object Model

```typescript
// e2e/pages/LoginPage.ts
import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async getErrorMessage() {
    return this.page.locator('[role="alert"]').textContent();
  }
}

// Usage in test
test('login with invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('invalid@example.com', 'wrongpassword');
  
  const error = await loginPage.getErrorMessage();
  expect(error).toContain('Invalid credentials');
});
```

## Coverage

### Coverage Thresholds

We aim for:
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Viewing Coverage

```bash
# Frontend
cd frontend
npm run test:coverage
open coverage/index.html

# Backend
cd backend
npm run test:coverage
open coverage/lcov-report/index.html
```

### Coverage Configuration

**Frontend (vitest.config.ts)**:
```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  lines: 80,
  functions: 80,
  branches: 80,
  statements: 80,
}
```

**Backend (jest.config.js)**:
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

## Best Practices

### General
1. **Test behavior, not implementation**
2. **Write descriptive test names**
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Keep tests independent**
5. **Use meaningful assertions**
6. **Mock external dependencies**
7. **Test edge cases and error scenarios**

### Component Testing
1. **Test user interactions**
2. **Use accessible queries** (getByRole, getByLabelText)
3. **Avoid testing implementation details**
4. **Test loading and error states**
5. **Use userEvent over fireEvent**

### API Testing
1. **Test all HTTP methods**
2. **Test authentication and authorization**
3. **Test validation errors**
4. **Test edge cases (empty data, large payloads)**
5. **Use realistic test data**

### E2E Testing
1. **Test critical user journeys**
2. **Use Page Object Model for reusability**
3. **Keep tests independent**
4. **Use data-testid for stable selectors**
5. **Test across different browsers**

## CI/CD Integration

Tests run automatically on:
- Every pull request
- Push to main/develop branches
- Before deployment

### GitHub Actions

```yaml
- name: Run tests
  run: npm test

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Troubleshooting

### Common Issues

#### Tests timing out
```typescript
// Increase timeout
test('slow test', async () => {
  // ...
}, 30000); // 30 seconds
```

#### Flaky tests
- Use `waitFor` for async operations
- Avoid hardcoded delays
- Use proper test isolation

#### Coverage not updating
```bash
# Clear coverage cache
rm -rf coverage
npm run test:coverage
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
