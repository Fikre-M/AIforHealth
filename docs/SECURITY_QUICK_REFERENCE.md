# Security Quick Reference

Quick reference guide for developers working on the AI for Health platform.

## Environment Variables

### Never Commit Secrets
```bash
# ❌ BAD - Hardcoded secret
const JWT_SECRET = "my-secret-key";

# ✅ GOOD - Use environment variables
const JWT_SECRET = process.env.JWT_SECRET;
```

### Use Secrets Manager in Production
```typescript
// Development: .env files
// Production: AWS Secrets Manager, HashiCorp Vault

import { getSecret } from '@/config/secrets';

const apiKey = await getSecret('OPENAI_API_KEY');
```

## Authentication

### Protect Routes
```typescript
import { authenticate, authorize } from '@/middleware/auth';

// Require authentication
router.get('/profile', authenticate, getProfile);

// Require specific role
router.post('/admin/users', authenticate, authorize(['admin']), createUser);
```

### Password Handling
```typescript
import bcrypt from 'bcryptjs';

// Hash password (12 rounds)
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

### JWT Tokens
```typescript
// Generate token
const token = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET!);
```

## Input Validation

### Use Zod for Schema Validation
```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
  age: z.number().min(0).max(150).optional(),
});

// Validate input
const validatedData = userSchema.parse(req.body);
```

### Sanitize User Input
```typescript
// Remove HTML tags
import DOMPurify from 'isomorphic-dompurify';

const clean = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: []
});
```

### Validate File Uploads
```typescript
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const maxSize = 5 * 1024 * 1024; // 5MB

if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}

if (file.size > maxSize) {
  throw new Error('File too large');
}
```

## Error Handling

### Don't Expose Sensitive Information
```typescript
// ❌ BAD - Exposes internal details
res.status(500).json({ 
  error: error.message,
  stack: error.stack 
});

// ✅ GOOD - Generic message
res.status(500).json({ 
  error: 'Internal server error',
  requestId: req.id 
});
```

### Log Errors Securely
```typescript
import { logError } from '@/utils/logger';

try {
  // Operation
} catch (error) {
  // Log with context, but don't expose to user
  logError('Operation failed', error, { userId: req.user?.id });
  
  res.status(500).json({ 
    error: 'Operation failed',
    requestId: req.id 
  });
}
```

## Rate Limiting

### Apply Rate Limits
```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests'
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});

router.post('/login', authLimiter, login);
router.use('/api', apiLimiter);
```

## Database Security

### Use Parameterized Queries
```typescript
// ✅ GOOD - Mongoose automatically parameterizes
const user = await User.findOne({ email: userEmail });

// ❌ BAD - Never construct queries from strings
const query = `db.users.find({ email: "${userEmail}" })`;
```

### Validate ObjectIds
```typescript
import mongoose from 'mongoose';

if (!mongoose.Types.ObjectId.isValid(id)) {
  throw new Error('Invalid ID format');
}
```

## HTTPS/TLS

### Enforce HTTPS in Production
```typescript
// middleware/security.ts
export const enforceHTTPS = (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }
  next();
};
```

### Set Security Headers
```typescript
import helmet from 'helmet';

app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## CORS Configuration

### Restrict Origins
```typescript
// ❌ BAD - Allows all origins
app.use(cors({ origin: '*' }));

// ✅ GOOD - Specific origins only
app.use(cors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

## Session Management

### Secure Session Configuration
```typescript
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  }
}));
```

## API Security

### Validate API Keys
```typescript
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};
```

### Implement Request Signing
```typescript
import crypto from 'crypto';

const signature = crypto
  .createHmac('sha256', process.env.API_SECRET!)
  .update(JSON.stringify(payload))
  .digest('hex');
```

## Logging

### Log Security Events
```typescript
import { logSecurity } from '@/utils/logger';

// Log authentication attempts
logSecurity('login_attempt', { 
  email, 
  success: false, 
  ip: req.ip 
});

// Log access to sensitive data
logSecurity('phi_access', { 
  userId: req.user.id, 
  patientId, 
  action: 'view' 
});
```

### Don't Log Sensitive Data
```typescript
// ❌ BAD - Logs password
logger.info('User login', { email, password });

// ✅ GOOD - No sensitive data
logger.info('User login', { email, success: true });
```

## Common Vulnerabilities

### SQL/NoSQL Injection
```typescript
// ✅ Use ORM/ODM (Mongoose)
User.findOne({ email });

// ❌ Never use string concatenation
db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

### XSS (Cross-Site Scripting)
```typescript
// ✅ Sanitize HTML input
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(userInput);

// ✅ Use Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"]
  }
}));
```

### CSRF (Cross-Site Request Forgery)
```typescript
import csrf from 'csurf';

// Enable CSRF protection
app.use(csrf({ cookie: true }));

// Include token in forms
<input type="hidden" name="_csrf" value="{{ csrfToken }}" />
```

### Path Traversal
```typescript
import path from 'path';

// ❌ BAD - Vulnerable to path traversal
const filePath = `./uploads/${req.params.filename}`;

// ✅ GOOD - Validate and sanitize
const filename = path.basename(req.params.filename);
const filePath = path.join(__dirname, 'uploads', filename);
```

## Testing Security

### Test Authentication
```typescript
describe('Authentication', () => {
  it('should reject invalid tokens', async () => {
    const res = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(res.status).toBe(401);
  });
});
```

### Test Authorization
```typescript
it('should prevent unauthorized access', async () => {
  const res = await request(app)
    .post('/api/v1/admin/users')
    .set('Authorization', `Bearer ${patientToken}`);
  
  expect(res.status).toBe(403);
});
```

### Test Input Validation
```typescript
it('should reject invalid email', async () => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ email: 'invalid-email', password: 'password123' });
  
  expect(res.status).toBe(400);
});
```

## Security Checklist for PRs

Before submitting a pull request:

- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all user inputs
- [ ] Authentication/authorization properly implemented
- [ ] Error messages don't expose sensitive information
- [ ] Logging doesn't include sensitive data
- [ ] Dependencies updated and `npm audit` clean
- [ ] Security headers configured
- [ ] Rate limiting applied where appropriate
- [ ] Tests include security scenarios

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## Report Security Issues

If you discover a security vulnerability, please email: security@aiforhealth.com

Do not create public GitHub issues for security vulnerabilities.
