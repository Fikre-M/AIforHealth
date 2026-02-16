# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of AI for Health seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do Not

- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed
- Exploit the vulnerability beyond what is necessary to demonstrate it

### Please Do

1. **Email us directly** at: security@aiforhealth.com
2. **Include the following information**:
   - Type of vulnerability (e.g., SQL injection, XSS, authentication bypass)
   - Full paths of source file(s) related to the vulnerability
   - Location of the affected source code (tag/branch/commit or direct URL)
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Communication**: We will keep you informed about the progress of fixing the vulnerability
- **Timeline**: We aim to address critical vulnerabilities within 7 days and other vulnerabilities within 30 days
- **Credit**: We will credit you in our security advisory (unless you prefer to remain anonymous)

## Security Measures

### Current Security Features

- **Authentication**: JWT-based authentication with bcrypt password hashing (12 rounds)
- **Authorization**: Role-based access control (RBAC) for admin, doctor, and patient roles
- **Input Validation**: Comprehensive validation using Zod and express-validator
- **Rate Limiting**: Protection against brute force and DDoS attacks
- **Security Headers**: Helmet.js configuration with CSP, HSTS, and other security headers
- **CORS**: Properly configured Cross-Origin Resource Sharing
- **Error Handling**: Secure error handling without information leakage
- **Logging**: Comprehensive security event logging with Winston and Sentry

### Planned Security Enhancements

- Multi-factor authentication (MFA)
- Secrets management integration (AWS Secrets Manager, HashiCorp Vault)
- Enhanced encryption for sensitive medical data
- Regular security audits and penetration testing
- Automated vulnerability scanning in CI/CD pipeline

## Security Best Practices for Contributors

If you're contributing to this project, please follow these security guidelines:

1. **Never commit secrets**: Use environment variables for all sensitive data
2. **Validate all inputs**: Use Zod schemas for input validation
3. **Sanitize user data**: Prevent XSS and injection attacks
4. **Use parameterized queries**: Prevent SQL/NoSQL injection
5. **Implement proper authentication**: Use provided middleware for protected routes
6. **Handle errors securely**: Don't expose sensitive information in error messages
7. **Keep dependencies updated**: Regularly run `npm audit` and update packages
8. **Follow OWASP guidelines**: Refer to OWASP Top 10 for common vulnerabilities

## Security Documentation

For detailed security information, please refer to:

- [Security Guidelines](docs/SECURITY.md) - Comprehensive security documentation
- [Security Quick Reference](docs/SECURITY_QUICK_REFERENCE.md) - Developer quick reference
- [Security Checklist](docs/deployment/SECURITY_CHECKLIST.md) - Pre-production checklist

## Compliance

This project aims to comply with:

- **OWASP Top 10**: Protection against common web vulnerabilities
- **HIPAA**: Healthcare data privacy and security (for medical records)
- **GDPR**: Data protection and privacy (where applicable)

## Security Updates

We will publish security advisories for any vulnerabilities that affect this project. Subscribe to our GitHub repository to receive notifications about security updates.

## Bug Bounty Program

We currently do not have a bug bounty program, but we greatly appreciate responsible disclosure of security vulnerabilities. We will acknowledge security researchers who help us improve the security of our platform.

## Contact

For security-related questions or concerns:

- **Email**: security@aiforhealth.com
- **GitHub Security Advisories**: [Create a security advisory](https://github.com/Fikre-M/AIforHealth/security/advisories/new)

## Acknowledgments

We would like to thank the following security researchers for responsibly disclosing vulnerabilities:

- (List will be updated as vulnerabilities are reported and fixed)

---

**Last Updated**: February 2026
