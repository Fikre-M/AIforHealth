# Security Guidelines

## OWASP Top 10 Compliance Checklist

### 1. Broken Access Control
- [x] JWT-based authentication implemented
- [x] Role-based access control (RBAC) for admin, doctor, patient
- [x] Protected routes with authentication middleware
- [ ] Regular access control audits
- [ ] Implement attribute-based access control (ABAC) for fine-grained permissions

### 2. Cryptographic Failures
- [x] Passwords hashed with bcrypt (12 rounds)
- [x] JWT tokens for session management
- [ ] HTTPS/TLS enforcement in production
- [ ] Secrets stored in environment variables
- [ ] Implement secrets management solution (AWS Secrets Manager, HashiCorp Vault)
- [ ] Rotate JWT secrets regularly
- [ ] Encrypt sensitive data at rest (medical records, PII)

### 3. Injection
- [x] MongoDB with Mongoose (parameterized queries)
- [x] Input validation with express-validator and Zod
- [x] Request body parsing limits
- [ ] Sanitize user inputs
- [ ] Implement SQL injection prevention (if using SQL databases)
- [ ] NoSQL injection prevention

### 4. Insecure Design
- [x] Rate limiting implemented
- [x] Error handling without sensitive data exposure
- [ ] Threat modeling documentation
- [ ] Security requirements in design phase
- [ ] Implement circuit breakers for external services

### 5. Security Misconfiguration
- [x] Helmet.js for security headers
- [x] CORS properly configured
- [x] Environment-based configuration
- [ ] Remove default credentials
- [ ] Disable directory listing
- [ ] Remove unnecessary features/endpoints
- [ ] Security hardening checklist for deployment

### 6. Vulnerable and Outdated Components
- [x] Package.json with specific versions
- [ ] Regular dependency updates (npm audit)
- [ ] Automated vulnerability scanning (Snyk, Dependabot)
- [ ] Monitor security advisories

### 7. Identification and Authentication Failures
- [x] Strong password requirements
- [x] JWT token expiration
- [x] Refresh token mechanism
- [ ] Multi-factor authentication (MFA)
- [ ] Account lockout after failed attempts
- [ ] Password reset with secure tokens
- [ ] Session timeout implementation

### 8. Software and Data Integrity Failures
- [x] Code review process
- [ ] CI/CD pipeline security
- [ ] Signed commits
- [ ] Integrity checks for dependencies
- [ ] Implement Content Security Policy (CSP)

### 9. Security Logging and Monitoring Failures
- [x] Winston logger implementation
- [x] Sentry error monitoring
- [x] Request logging with correlation IDs
- [ ] Security event logging (failed logins, access violations)
- [ ] Log retention policy
- [ ] Real-time alerting for security events
- [ ] Regular log analysis

### 10. Server-Side Request Forgery (SSRF)
- [ ] Validate and sanitize URLs
- [ ] Whitelist allowed domains for external requests
- [ ] Network segmentation
- [ ] Disable unnecessary protocols

## Environment Variables & Secrets Management

### Current State
- Basic .env file approach
- Secrets stored in plain text locally
- No rotation strategy

### Recommended Improvements

#### Development
```bash
# Use .env files with clear warnings
# Never commit .env files to version control
# Use .env.example as template
```

#### Production
1. Use a secrets management service:
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - Google Cloud Secret Manager

2. Implement secret rotation:
   - JWT secrets: Every 90 days
   - API keys: Every 180 days
   - Database credentials: Every 90 days

3. Access control:
   - Principle of least privilege
   - Audit logs for secret access
   - Separate secrets per environment

### Implementation Example (AWS Secrets Manager)

```typescript
// config/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

export async function getSecret(secretName: string): Promise<string> {
  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretName })
    );
    return response.SecretString || '';
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
}
```

## HTTPS/TLS Enforcement

### Production Requirements
1. Force HTTPS for all connections
2. Use TLS 1.2 or higher
3. Strong cipher suites only
4. HSTS (HTTP Strict Transport Security) headers

### Implementation

#### Express Middleware
```typescript
// middleware/httpsRedirect.ts
import { Request, Response, NextFunction } from 'express';

export const enforceHTTPS = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
};
```

#### Helmet Configuration
```typescript
app.use(helmet({
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      upgradeInsecureRequests: []
    }
  }
}));
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}
```

## Security Middleware Configuration

### Current Implementation
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Request logging

### Enhanced Configuration

```typescript
// middleware/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

// Rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

// NoSQL injection prevention
export const sanitizeData = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized ${key} in request`);
  },
});

// HTTP Parameter Pollution prevention
export const preventHPP = hpp({
  whitelist: ['sort', 'filter', 'page', 'limit']
});
```

## Input Validation & Sanitization

### Validation Strategy
1. Validate all user inputs
2. Use schema validation (Zod, Joi)
3. Sanitize HTML inputs
4. Validate file uploads

### Example Implementation
```typescript
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Schema validation
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
});

// Sanitize HTML
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};
```

## Security Headers

### Required Headers
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
  frameguard: { action: 'deny' },
}));
```

## Pre-Production Security Audit Checklist

### Code Review
- [ ] Security-focused code review completed
- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all endpoints
- [ ] Proper error handling without information leakage
- [ ] Authentication and authorization properly implemented

### Dependency Audit
- [ ] Run `npm audit` and fix all vulnerabilities
- [ ] Update all dependencies to latest secure versions
- [ ] Remove unused dependencies
- [ ] Review licenses for compliance

### Configuration Review
- [ ] Environment variables properly configured
- [ ] Secrets management implemented
- [ ] HTTPS/TLS enforced
- [ ] Security headers configured
- [ ] CORS properly restricted
- [ ] Rate limiting enabled
- [ ] Logging and monitoring active

### Infrastructure Security
- [ ] Firewall rules configured
- [ ] Database access restricted
- [ ] Network segmentation implemented
- [ ] Backup and disaster recovery plan
- [ ] DDoS protection enabled
- [ ] WAF (Web Application Firewall) configured

### Testing
- [ ] Security testing completed (SAST/DAST)
- [ ] Penetration testing performed
- [ ] Vulnerability scanning completed
- [ ] Load testing with security scenarios
- [ ] Authentication/authorization testing

### Compliance
- [ ] HIPAA compliance review (for healthcare data)
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policies documented
- [ ] Privacy policy updated
- [ ] Terms of service reviewed

### Monitoring & Response
- [ ] Security monitoring configured
- [ ] Incident response plan documented
- [ ] Alert thresholds configured
- [ ] Log aggregation and analysis setup
- [ ] Security team contacts documented

## Additional Security Measures

### API Security
- Implement API versioning
- Use API keys for third-party integrations
- Implement request signing for sensitive operations
- Add request/response encryption for sensitive data

### Database Security
- Use connection pooling with limits
- Implement query timeouts
- Regular database backups
- Encrypt sensitive fields
- Audit database access logs

### File Upload Security
- Validate file types and sizes
- Scan uploads for malware
- Store files outside web root
- Use signed URLs for access
- Implement virus scanning

### Session Management
- Secure session storage
- Session timeout implementation
- Logout functionality
- Concurrent session limits
- Session fixation prevention

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## Contact

For security concerns or to report vulnerabilities, contact: security@aiforhealth.com
