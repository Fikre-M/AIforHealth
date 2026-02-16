# Pre-Production Security Checklist

Use this checklist before deploying to production to ensure all security measures are in place.

## 1. Code Security

### Authentication & Authorization
- [ ] All protected routes have authentication middleware
- [ ] Role-based access control (RBAC) properly implemented
- [ ] JWT tokens have appropriate expiration times
- [ ] Refresh token mechanism working correctly
- [ ] Password requirements enforced (min 8 chars, complexity)
- [ ] Account lockout after failed login attempts
- [ ] Password reset functionality secure

### Input Validation
- [ ] All user inputs validated with Zod/express-validator
- [ ] File upload validation (type, size, content)
- [ ] SQL/NoSQL injection prevention in place
- [ ] XSS prevention implemented
- [ ] CSRF protection enabled for state-changing operations
- [ ] Request size limits configured

### Error Handling
- [ ] No sensitive information in error messages
- [ ] Generic error messages for authentication failures
- [ ] Stack traces disabled in production
- [ ] Error logging without exposing internals
- [ ] 404/500 error pages don't leak information

### Code Quality
- [ ] No hardcoded credentials or secrets
- [ ] No commented-out sensitive code
- [ ] No debug/console logs in production code
- [ ] Code review completed by security-aware developer
- [ ] Static analysis (SAST) completed

## 2. Configuration Security

### Environment Variables
- [ ] All secrets moved to environment variables
- [ ] .env files not committed to version control
- [ ] .env.example updated with all required variables
- [ ] Production secrets different from development
- [ ] Secrets management solution implemented (AWS Secrets Manager, Vault)

### HTTPS/TLS
- [ ] HTTPS enforced for all connections
- [ ] Valid SSL/TLS certificate installed
- [ ] TLS 1.2 or higher configured
- [ ] Strong cipher suites only
- [ ] HSTS header enabled (max-age=31536000)
- [ ] HTTP to HTTPS redirect configured

### Security Headers
- [ ] Helmet.js configured and enabled
- [ ] Content-Security-Policy (CSP) configured
- [ ] X-Frame-Options set to DENY
- [ ] X-Content-Type-Options set to nosniff
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy configured

### CORS
- [ ] CORS restricted to specific origins (no wildcards)
- [ ] Credentials properly configured
- [ ] Preflight requests handled correctly
- [ ] Allowed methods restricted to necessary ones

### Rate Limiting
- [ ] Rate limiting enabled on all endpoints
- [ ] Stricter limits on authentication endpoints
- [ ] Rate limit headers exposed
- [ ] IP-based rate limiting configured
- [ ] Consider implementing distributed rate limiting (Redis)

## 3. Database Security

### MongoDB Configuration
- [ ] Authentication enabled
- [ ] Strong database passwords
- [ ] Database access restricted by IP
- [ ] Connection string uses authentication
- [ ] Connection pooling configured
- [ ] Query timeouts set
- [ ] Indexes optimized for performance

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] PII (Personally Identifiable Information) identified
- [ ] Medical records encrypted
- [ ] Backup encryption enabled
- [ ] Data retention policy documented
- [ ] GDPR/HIPAA compliance reviewed

## 4. Dependency Security

### Package Management
- [ ] `npm audit` run and all vulnerabilities fixed
- [ ] All dependencies updated to latest secure versions
- [ ] Unused dependencies removed
- [ ] Package-lock.json committed
- [ ] Automated vulnerability scanning enabled (Snyk, Dependabot)

### Third-Party Services
- [ ] API keys rotated and secured
- [ ] Third-party service credentials in secrets manager
- [ ] Service account permissions minimized
- [ ] API rate limits understood and handled
- [ ] Fallback mechanisms for service failures

## 5. Infrastructure Security

### Server Configuration
- [ ] Firewall rules configured (only necessary ports open)
- [ ] SSH access restricted (key-based only)
- [ ] Root login disabled
- [ ] Fail2ban or similar intrusion prevention installed
- [ ] Server hardening completed
- [ ] OS and packages updated

### Network Security
- [ ] Network segmentation implemented
- [ ] Database not publicly accessible
- [ ] Private subnets for backend services
- [ ] VPC/Security groups properly configured
- [ ] DDoS protection enabled
- [ ] WAF (Web Application Firewall) configured

### Container Security (if using Docker)
- [ ] Base images from trusted sources
- [ ] Images scanned for vulnerabilities
- [ ] Non-root user in containers
- [ ] Secrets not in Docker images
- [ ] Resource limits configured
- [ ] Container registry secured

## 6. Logging & Monitoring

### Logging
- [ ] Comprehensive logging implemented (Winston)
- [ ] Security events logged (failed logins, access violations)
- [ ] Logs don't contain sensitive data (passwords, tokens)
- [ ] Log rotation configured
- [ ] Log retention policy defined
- [ ] Centralized log aggregation (ELK, CloudWatch)

### Monitoring
- [ ] Error monitoring enabled (Sentry)
- [ ] Performance monitoring configured
- [ ] Uptime monitoring setup
- [ ] Security alerts configured
- [ ] Anomaly detection enabled
- [ ] Dashboard for security metrics

### Incident Response
- [ ] Incident response plan documented
- [ ] Security team contacts defined
- [ ] Escalation procedures documented
- [ ] Backup and recovery procedures tested
- [ ] Communication plan for breaches

## 7. Testing

### Security Testing
- [ ] Penetration testing completed
- [ ] Vulnerability scanning performed
- [ ] OWASP ZAP or similar tool run
- [ ] Authentication/authorization testing
- [ ] Input validation testing
- [ ] Session management testing

### Load Testing
- [ ] Load testing with security scenarios
- [ ] Rate limiting tested under load
- [ ] DDoS simulation performed
- [ ] Database performance under load tested

### Automated Testing
- [ ] Security tests in CI/CD pipeline
- [ ] Automated dependency scanning
- [ ] SAST (Static Application Security Testing)
- [ ] DAST (Dynamic Application Security Testing)

## 8. Compliance

### Healthcare Compliance (HIPAA)
- [ ] HIPAA compliance review completed
- [ ] PHI (Protected Health Information) identified
- [ ] Access controls for PHI implemented
- [ ] Audit logs for PHI access
- [ ] Business Associate Agreements (BAA) signed
- [ ] Encryption for PHI at rest and in transit

### Data Privacy (GDPR)
- [ ] Privacy policy updated and accessible
- [ ] Cookie consent implemented
- [ ] Data subject rights implemented (access, deletion)
- [ ] Data processing agreements signed
- [ ] Data breach notification procedures
- [ ] Privacy by design principles followed

### General Compliance
- [ ] Terms of service reviewed
- [ ] Acceptable use policy defined
- [ ] Data retention policy documented
- [ ] Compliance documentation complete

## 9. Backup & Recovery

### Backup Strategy
- [ ] Automated backups configured
- [ ] Backup encryption enabled
- [ ] Backup retention policy defined
- [ ] Offsite backup storage
- [ ] Backup restoration tested
- [ ] Recovery Time Objective (RTO) defined
- [ ] Recovery Point Objective (RPO) defined

### Disaster Recovery
- [ ] Disaster recovery plan documented
- [ ] Failover procedures tested
- [ ] Multi-region deployment (if applicable)
- [ ] Database replication configured
- [ ] Regular DR drills scheduled

## 10. Documentation

### Security Documentation
- [ ] Security architecture documented
- [ ] Threat model created
- [ ] Security policies documented
- [ ] Runbooks for security incidents
- [ ] API security documentation
- [ ] Security training materials

### Operational Documentation
- [ ] Deployment procedures documented
- [ ] Configuration management documented
- [ ] Secrets rotation procedures
- [ ] Monitoring and alerting guide
- [ ] Troubleshooting guide

## 11. Final Checks

### Pre-Deployment
- [ ] Security review meeting completed
- [ ] All checklist items addressed or documented
- [ ] Risk assessment completed
- [ ] Stakeholder sign-off obtained
- [ ] Rollback plan prepared
- [ ] Communication plan for deployment

### Post-Deployment
- [ ] Security monitoring active
- [ ] Alerts functioning correctly
- [ ] Performance metrics baseline established
- [ ] Security scan of production environment
- [ ] Penetration test of production (if allowed)
- [ ] Post-deployment review scheduled

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Security Lead | | | |
| DevOps Engineer | | | |
| Product Manager | | | |

## Notes

Document any items that are not completed and the plan to address them:

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [GDPR Guidelines](https://gdpr.eu/)
