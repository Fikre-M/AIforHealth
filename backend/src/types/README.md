# Types Directory

This directory contains all TypeScript type definitions and enums for the backend.

## Files

### `index.ts`
Main types file containing:
- Interfaces for models (IUser, IPatient, IDoctor, etc.)
- API response types
- Service layer DTOs
- Utility types
- Type guards

### `enums.ts`
Runtime enums that can be used with `Object.values()`:
- UserRole
- AppointmentStatus
- AppointmentType
- NotificationType
- And more...

## Usage

### Using Enums

Enums are actual runtime values that can be used in Mongoose schemas and validation:

```typescript
import { UserRole } from '@/types/enums';

// In Mongoose schema
const schema = new Schema({
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.PATIENT,
  },
});

// In validation
if (role === UserRole.ADMIN) {
  // ...
}
```

### Using Types

Types are compile-time only and used for TypeScript type checking:

```typescript
import type { IUser, CreateUserDTO } from '@/types';

// Function parameter types
async function createUser(data: CreateUserDTO): Promise<IUser> {
  // ...
}
```

## Important Notes

### Enums vs Types

- **Enums** (`enums.ts`): Use when you need runtime values (Mongoose schemas, validation, Object.values())
- **Types** (`index.ts`): Use for TypeScript type checking only

### Example: UserRole

```typescript
// Enum (runtime value)
export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

// Type (compile-time only)
export type UserRole = 'patient' | 'doctor' | 'admin';
```

Both are exported from `@/types`, but use the enum when you need runtime values:

```typescript
// ✅ Good - Using enum
import { UserRole } from '@/types/enums';
enum: Object.values(UserRole)

// ❌ Bad - Using type
import { UserRole } from '@/types';
enum: Object.values(UserRole) // Error: Cannot convert undefined or null to object
```

## Adding New Enums

When adding a new enum:

1. Add the enum to `enums.ts`:
```typescript
export enum MyNewEnum {
  VALUE1 = 'value1',
  VALUE2 = 'value2',
}
```

2. Add the corresponding type to `index.ts`:
```typescript
export type MyNewEnum = 'value1' | 'value2';
```

3. Export the enum from `index.ts`:
```typescript
export * from './enums';
```

This ensures backward compatibility and allows both runtime and compile-time usage.
