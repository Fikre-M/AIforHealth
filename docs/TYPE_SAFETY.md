# Type Safety Guide

Comprehensive guide for maintaining type safety in the AI for Health project.

## Overview

We use strict TypeScript configuration to ensure type safety across the entire codebase. This prevents runtime errors, improves code quality, and enhances developer experience.

## TypeScript Configuration

### Strict Mode Enabled

Both frontend and backend use strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Key Strict Checks

1. **noImplicitAny**: No implicit `any` types allowed
2. **strictNullChecks**: `null` and `undefined` must be explicitly handled
3. **noUncheckedIndexedAccess**: Array/object access returns `T | undefined`
4. **noImplicitReturns**: All code paths must return a value
5. **strictFunctionTypes**: Function parameter types are checked contravariantly

## Type Definitions

### Frontend Types (`frontend/src/types/`)

```typescript
// Core types
import type { User, Patient, Doctor, Appointment } from '@/types';

// API types
import type { AuthService, PatientService } from '@/types/api';
```

### Backend Types (`backend/src/types/`)

```typescript
// Core types
import type { IUser, IPatient, IDoctor } from '@/types';

// Request types
import type { AuthenticatedRequest, JWTPayload } from '@/types';
```

## Best Practices

### 1. Avoid `any` Type

```typescript
// ❌ Bad - Using any
function processData(data: any) {
  return data.value;
}

// ✅ Good - Use specific types
function processData(data: { value: string }): string {
  return data.value;
}

// ✅ Good - Use unknown for truly unknown types
function processData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String(data.value);
  }
  throw new Error('Invalid data');
}
```

### 2. Handle Null and Undefined

```typescript
// ❌ Bad - Not handling null
function getUserName(user: User): string {
  return user.name; // Error if user is null
}

// ✅ Good - Explicit null check
function getUserName(user: User | null): string {
  if (!user) {
    return 'Guest';
  }
  return user.name;
}

// ✅ Good - Optional chaining
function getUserName(user: User | null): string {
  return user?.name ?? 'Guest';
}
```

### 3. Type Array Access

```typescript
// ❌ Bad - Unchecked array access
function getFirstItem<T>(items: T[]): T {
  return items[0]; // Could be undefined
}

// ✅ Good - Check for undefined
function getFirstItem<T>(items: T[]): T | undefined {
  return items[0];
}

// ✅ Good - With default value
function getFirstItem<T>(items: T[], defaultValue: T): T {
  return items[0] ?? defaultValue;
}
```

### 4. Type Function Returns

```typescript
// ❌ Bad - Implicit return type
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Good - Explicit return type
function calculateTotal(items: Array<{ price: number }>): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### 5. Use Type Guards

```typescript
// Type guard function
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'name' in value
  );
}

// Usage
function processUser(data: unknown): void {
  if (isUser(data)) {
    // TypeScript knows data is User here
    console.log(data.email);
  }
}
```

### 6. Use Discriminated Unions

```typescript
// Define discriminated union
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Type-safe handling
function handleResponse<T>(response: ApiResponse<T>): T {
  if (response.success) {
    return response.data; // TypeScript knows this is T
  } else {
    throw new Error(response.error); // TypeScript knows this has error
  }
}
```

### 7. Generic Types

```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
}

// Generic constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

### 8. Utility Types

```typescript
// Partial - Make all properties optional
type PartialUser = Partial<User>;

// Required - Make all properties required
type RequiredUser = Required<User>;

// Pick - Select specific properties
type UserCredentials = Pick<User, 'email' | 'password'>;

// Omit - Exclude specific properties
type UserWithoutPassword = Omit<User, 'password'>;

// Record - Create object type with specific keys
type UserRoles = Record<string, UserRole>;

// Custom utility types
type RequiredNotNull<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};
```

## Common Patterns

### API Service Types

```typescript
// Define service interface
interface UserService {
  getUser(id: string): Promise<ApiResponse<User>>;
  updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>>;
  deleteUser(id: string): Promise<ApiResponse<void>>;
}

// Implementation
class UserServiceImpl implements UserService {
  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    return { success: true, data: undefined };
  }
}
```

### React Component Types

```typescript
// Props interface
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

// Functional component
const Button: React.FC<ButtonProps> = ({ children, onClick, disabled, variant = 'primary' }) => {
  return (
    <button onClick={onClick} disabled={disabled} className={`btn-${variant}`}>
      {children}
    </button>
  );
};

// With generics
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
}

function Select<T>({ options, value, onChange, getLabel }: SelectProps<T>) {
  return (
    <select value={getLabel(value)} onChange={(e) => {
      const option = options.find(o => getLabel(o) === e.target.value);
      if (option) onChange(option);
    }}>
      {options.map((option, index) => (
        <option key={index} value={getLabel(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}
```

### Express Request Types

```typescript
// Extend Express Request
interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Typed route handler
const getUser = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<User>>
): Promise<void> => {
  const userId = req.user?.userId;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'User not authenticated',
      statusCode: 401,
    });
    return;
  }

  const user = await UserService.getUser(userId);
  res.json({
    success: true,
    data: user,
  });
};
```

### Mongoose Model Types

```typescript
// Define interface extending Document
interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Create schema with types
const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
});

// Add methods with proper typing
userSchema.methods.comparePassword = async function(
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create model
const User = model<IUser>('User', userSchema);
```

## Type Checking

### Run Type Checks

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

### CI/CD Integration

Type checking runs automatically in CI/CD:

```yaml
- name: Type check
  run: npm run type-check
```

## Common Type Errors

### Error: Type 'X' is not assignable to type 'Y'

```typescript
// Problem
const user: User = {
  id: 123, // Error: number not assignable to string
  email: 'test@example.com',
  name: 'Test',
};

// Solution
const user: User = {
  id: '123', // Correct type
  email: 'test@example.com',
  name: 'Test',
};
```

### Error: Object is possibly 'null' or 'undefined'

```typescript
// Problem
function getName(user: User | null): string {
  return user.name; // Error: user is possibly null
}

// Solution 1: Null check
function getName(user: User | null): string {
  if (!user) return 'Guest';
  return user.name;
}

// Solution 2: Optional chaining
function getName(user: User | null): string {
  return user?.name ?? 'Guest';
}
```

### Error: Element implicitly has an 'any' type

```typescript
// Problem
const users = ['Alice', 'Bob'];
const user = users[5]; // Type is string | undefined

// Solution: Handle undefined
const user = users[5];
if (user) {
  console.log(user.toUpperCase());
}
```

### Error: Property 'X' does not exist on type 'Y'

```typescript
// Problem
interface User {
  name: string;
}
const user: User = { name: 'Alice' };
console.log(user.age); // Error: Property 'age' does not exist

// Solution: Add property to interface
interface User {
  name: string;
  age?: number; // Optional property
}
```

## Migration Guide

### Converting from `any` to Proper Types

1. **Identify all `any` types**
   ```bash
   # Search for any types
   grep -r "any" src/
   ```

2. **Replace with `unknown` first**
   ```typescript
   // Before
   function process(data: any) {}
   
   // After
   function process(data: unknown) {}
   ```

3. **Add type guards**
   ```typescript
   function process(data: unknown) {
     if (typeof data === 'object' && data !== null) {
       // Type narrowing
     }
   }
   ```

4. **Create proper types**
   ```typescript
   interface ProcessData {
     id: string;
     value: number;
   }
   
   function process(data: ProcessData) {
     // Fully typed
   }
   ```

## Tools & Resources

### VS Code Extensions
- **TypeScript Error Translator**: Better error messages
- **Pretty TypeScript Errors**: Formatted error display
- **TypeScript Hero**: Auto-import and organize imports

### Useful Commands
```bash
# Check types without emitting files
tsc --noEmit

# Generate declaration files
tsc --declaration

# Watch mode
tsc --watch
```

### Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [Total TypeScript](https://www.totaltypescript.com/)

## Troubleshooting

### Type Check Fails in CI but Works Locally

1. Clear TypeScript cache:
   ```bash
   rm -rf node_modules/.cache
   ```

2. Ensure same TypeScript version:
   ```bash
   npm list typescript
   ```

3. Check tsconfig.json is committed

### Slow Type Checking

1. Use project references for monorepos
2. Enable incremental compilation
3. Exclude unnecessary files
4. Use `skipLibCheck: true` for node_modules

## Best Practices Summary

1. ✅ Always use explicit types
2. ✅ Enable all strict checks
3. ✅ Handle null/undefined explicitly
4. ✅ Use type guards for runtime checks
5. ✅ Prefer interfaces over types for objects
6. ✅ Use generics for reusable code
7. ✅ Document complex types
8. ✅ Run type checks in CI/CD
9. ❌ Never use `any` (use `unknown` instead)
10. ❌ Don't use type assertions unless necessary
