# Security and Privacy Documentation

## Overview

This document outlines the security and privacy practices implemented in the Aawaz backend system for stress and trauma assessment. Given the sensitive nature of the data (victim/complainant information, mental health indicators, personal narratives), security and privacy are paramount.

## Data Protection Principles

### 1. Data Minimization
- Only collect data necessary for assessment and support
- Avoid storing raw audio files permanently
- Minimize logging of sensitive narrative content
- Use anonymized identifiers where possible

### 2. Consent Management
- Explicit consent required before AI assessment
- Consent recorded with timestamp and metadata
- Users can withdraw consent at any time
- Separate consent types for different processing activities

### 3. Data Retention
- Audit logs automatically expire after 90 days
- Temporary audio files cleaned up within 24 hours
- Assessment data retained according to legal requirements
- User can request data deletion

## Security Measures

### Authentication & Authorization

#### JWT-Based Authentication
- Secure token-based authentication
- Tokens expire after 24 hours
- Token validation on every protected endpoint
- Secure token storage recommended (httpOnly cookies)

#### Role-Based Access Control (RBAC)
- Five user roles with different permission levels:
  - `victim`: Can create assessments and view own data
  - `counsellor`: Can view assigned cases and provide support
  - `medical_professional`: Can view medical-related cases
  - `authorized_officer`: Can access dashboard and review cases
  - `admin`: Full system access

#### Multi-Factor Authentication (MFA)
- Optional 2FA support for user accounts
- Recommended for professional and officer accounts
- Secure verification code generation

### Data Security

#### Password Security
- Passwords hashed using bcrypt with 10 salt rounds
- Minimum password length: 8 characters
- Password change functionality
- No password recovery (reset tokens recommended)

#### Database Security
- MongoDB connection with authentication
- Database access restricted to application layer
- No direct database access from frontend
- Regular database backups recommended

#### API Security
- Helmet middleware for security headers
- CORS configured to allow only specified origins
- Rate limiting: 100 requests per 15 minutes per IP
- Request validation using Joi schemas
- SQL injection prevention (NoSQL injection prevention for MongoDB)

### File Upload Security

#### Audio File Validation
- Only allowed formats: MP3, WAV, OGG, WebM, M4A
- Maximum file size: 10MB
- MIME type validation
- File content validation (recommended for production)

#### Temporary File Handling
- Audio files stored in temporary directory
- Automatic cleanup within 24 hours
- No permanent storage of raw audio
- Scheduled cleanup of old files

### Network Security

#### HTTPS Enforcement
- HTTPS required in production
- TLS/SSL configuration
- Secure cookie flags
- HSTS headers

#### CORS Configuration
- Allowlist of permitted origins
- Credentials handling
- Method and header restrictions
- Preflight request handling

### Audit Logging

#### Comprehensive Logging
- All API requests logged
- User actions tracked
- Data access recorded
- Failed authentication attempts logged

#### Log Security
- Logs stored securely in database
- Automatic 90-day retention
- No sensitive data in logs
- Log access restricted to administrators

## Privacy Practices

### User Privacy

#### Data Collection
- Only necessary data collected
- Clear consent for data processing
- User control over data sharing
- Anonymous option for sensitive reports

#### Data Access
- Users can only access their own data
- Professionals access only assigned cases
- Officers access based on role permissions
- Audit trail of all data access

#### Data Sharing
- No data shared with third parties without consent
- Referrals only to authorized professionals
- Emergency escalation only to authorized personnel
- No automated contact with external services

### AI/NLP Privacy

#### Text Analysis
- Raw text processed but not permanently stored in logs
- Analysis results stored as structured indicators
- No raw narratives exposed in logs
- AI provider modular for privacy-compliant alternatives

#### Audio Analysis
- Temporary audio processing only
- Speech-to-text abstraction layer
- No permanent audio storage
- Audio features extracted, not raw audio

### Emergency Handling

#### Safety Escalation
- AI system does NOT independently contact emergency services
- Safety escalation flags require human review
- No automated police/family/contact
- Professional review before any escalation

#### Crisis Response
- Clear protocols for critical risk cases
- Human professional intervention required
- No AI-driven emergency actions
- Established escalation chains

## Compliance Considerations

### Data Protection Regulations
- Designed with GDPR principles in mind
- Data minimization and purpose limitation
- User consent and rights
- Data portability and deletion rights

### Medical Data Protection
- Not a medical device (screening tool only)
- Clear disclaimer about limitations
- Professional review required for high-risk cases
- No medical diagnosis claims

### Legal Compliance
- NHAA compliance for data handling
- Evidence preservation for legal cases
- Chain of custody for referrals
- Audit trail for accountability

## Security Best Practices

### Development
- Environment variables for sensitive data
- No hardcoded credentials
- Secure coding practices
- Regular security reviews

### Deployment
- Production environment variables
- Secure database connections
- HTTPS enforcement
- Regular security updates

### Operations
- Regular security audits
- Penetration testing
- Incident response plan
- Security monitoring

## Known Limitations

### Current Implementation
- Demo AI/NLP implementation (keyword-based)
- No real-time encryption at rest (database encryption recommended)
- No intrusion detection system
- No DDoS protection (recommend CDN/proxy)

### Recommended Improvements
- Implement end-to-end encryption
- Add database encryption at rest
- Implement intrusion detection
- Add DDoS protection
- Regular security training for staff
- Implement data loss prevention

## Incident Response

### Security Incident Types
- Unauthorized data access
- Data breach
- System compromise
- Authentication bypass
- Data loss

### Response Steps
1. Identify and contain the incident
2. Assess impact and scope
3. Notify affected parties
4. Implement remediation measures
5. Document lessons learned
6. Update security measures

## Contact

For security concerns or vulnerabilities:
- Report to security team immediately
- Do not disclose publicly before patch
- Follow responsible disclosure
- Contact: [security-contact@example.com]

## Version History

- v1.0.0 - Initial security implementation
  - JWT authentication
  - RBAC implementation
  - Audit logging
  - File upload security
  - Rate limiting

## Acknowledgments

Security practices based on:
- OWASP Top 10
- NIST Cybersecurity Framework
- GDPR requirements
- Healthcare data protection best practices
