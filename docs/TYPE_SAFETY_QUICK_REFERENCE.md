# Type Safety Quick Reference

Quick patterns and examples for type-safe TypeScript development.

## Type Checking

```bash
# Check types
npm run type-check

# Watch mode
tsc --watch --noEmit
```

## Common Patterns

### Avoid `any`

```typescript
// ❌ Bad
function process(data: any) {}

// ✅ Good
function process(data: unknown) {
  if (typeof data === 'string') {
    // Type narrowed to string
  }
}
```

### Handle Null/Undefined

```typescript
// ❌ Bad
function getName(user: User): string {
  return user.name; // Error if user is null
}

// ✅ Good
function getName(user: User | null): string {
  return user?.name ?? 'Guest';
}
```

### Type Array Access

```typescript
// ❌ Bad
const first = items[0]; // Could be undefined

// ✅ Good
const first = items[0] ?? defaultValue;
```

### Explicit Return Types

```typescript
// ❌ Bad
function calculate(x, y) {
  return x + y;
}

// ✅ Good
function calculate(x: number, y: number): number {
  return x + y;
}
```

## Type Guards

```typescript
// Type guard function
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  );
}

// Usage
if (isUser(data)) {
  console.log(data.email); // TypeScript knows it's User
}
```

## Discriminated Unions

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handle<T>(result: Result<T>): T {
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error);
}
```

## Generics

```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

// Generic with constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
}
```

## Utility Types

```typescript
// Partial - all properties optional
type PartialUser = Partial<User>;

// Required - all properties required
type RequiredUser = Required<User>;

// Pick - select properties
type Credentials = Pick<User, 'email' | 'password'>;

// Omit - exclude properties
type SafeUser = Omit<User, 'password'>;

// Record - object with specific keys
type UserMap = Record<string, User>;

// NonNullable - remove null/undefined
type NotNull<T> = NonNullable<T>;
```

## React Component Types

```typescript
// Props interface
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

// Component
const Button: React.FC<ButtonProps> = ({ children, onClick, disabled }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
```

## API Types

```typescript
// Request type
interface LoginRequest {
  email: string;
  password: string;
}

// Response type
interface LoginResponse {
  user: User;
  token: string;
}

// Service method
async function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}
```

## Express Types

```typescript
// Extend Request
interface AuthRequest extends Request {
  user?: JWTPayload;
}

// Typed handler
const handler = async (
  req: AuthRequest,
  res: Response<ApiResponse<User>>
): Promise<void> => {
  const user = await getUser(req.user?.userId);
  res.json({ success: true, data: user });
};
```

## Mongoose Types

```typescript
// Interface extending Document
interface IUser extends Document {
  email: string;
  password: string;
  comparePassword(password: string): Promise<boolean>;
}

// Schema
const schema = new Schema<IUser>({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

// Method
schema.methods.comparePassword = async function(
  this: IUser,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};
```

## Type Narrowing

```typescript
// typeof
if (typeof value === 'string') {
  value.toUpperCase(); // string
}

// instanceof
if (error instanceof Error) {
  console.log(error.message); // Error
}

// in operator
if ('email' in user) {
  console.log(user.email); // has email property
}

// Array.isArray
if (Array.isArray(value)) {
  value.map(x => x); // array
}
```

## Async Types

```typescript
// Promise return type
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Awaited utility type
type UserData = Awaited<ReturnType<typeof fetchUser>>; // User
```

## Const Assertions

```typescript
// Mutable
const colors = ['red', 'blue']; // string[]

// Immutable
const colors = ['red', 'blue'] as const; // readonly ['red', 'blue']

// Object
const config = {
  api: 'https://api.example.com',
  timeout: 5000,
} as const;
```

## Index Signatures

```typescript
// Basic
interface StringMap {
  [key: string]: string;
}

// With known properties
interface Config {
  name: string;
  [key: string]: string | number;
}

// Safe access with noUncheckedIndexedAccess
const value = map['key']; // string | undefined
```

## Function Overloads

```typescript
// Overload signatures
function format(value: string): string;
function format(value: number): string;
function format(value: Date): string;

// Implementation
function format(value: string | number | Date): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  return value.toISOString();
}
```

## Common Errors

### Object is possibly 'null'

```typescript
// ❌ Error
user.name

// ✅ Fix
user?.name ?? 'Guest'
```

### Type 'X' is not assignable to type 'Y'

```typescript
// ❌ Error
const id: string = 123;

// ✅ Fix
const id: string = '123';
```

### Element implicitly has 'any' type

```typescript
// ❌ Error
const item = array[index];

// ✅ Fix
const item = array[index];
if (item) {
  // Use item
}
```

### Property does not exist

```typescript
// ❌ Error
user.age

// ✅ Fix - Add to interface
interface User {
  name: string;
  age?: number;
}
```

## Tips

1. Use `unknown` instead of `any`
2. Enable all strict checks
3. Handle null/undefined explicitly
4. Use type guards for runtime checks
5. Prefer interfaces for objects
6. Use generics for reusable code
7. Add explicit return types
8. Run type checks in CI/CD

## Resources

- [Full Type Safety Guide](TYPE_SAFETY.md)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
