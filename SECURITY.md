# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in RenVault, please report it responsibly:

### Contact Information

- **Email**: security@renvault.dev
- **GitHub**: Create a private security advisory
- **Response Time**: 48 hours maximum

### What to Include

1. **Description**: Clear description of the vulnerability
2. **Impact**: Potential impact and affected components
3. **Reproduction**: Steps to reproduce the issue
4. **Proof of Concept**: Code or screenshots if applicable

### Security Considerations

#### Smart Contract Security

- All contracts undergo comprehensive testing
- Clarity 4 type safety reduces common vulnerabilities
- Access controls implemented for sensitive functions
- Fee calculations use safe arithmetic operations

#### Frontend Security

- Wallet connections use official Stacks Connect
- No private keys stored in frontend
- Environment variables for sensitive configuration
- HTTPS enforced for all network communications

#### Known Security Features

- **Input Validation**: All contract inputs validated
- **Access Control**: Owner-only functions protected
- **Safe Math**: Overflow protection in calculations
- **Error Handling**: Comprehensive error codes

### Security Best Practices

#### For Users

1. Always verify contract addresses before interacting
2. Use official wallet applications
3. Review transaction details before signing
4. Keep wallet software updated

#### For Developers

1. Test all contract functions thoroughly
2. Use official Stacks libraries
3. Validate all user inputs
4. Follow Clarity best practices

### Audit Status

- **Internal Review**: Completed
- **Community Review**: Ongoing
- **External Audit**: Planned for Q2 2024

### Audit Status

- **Internal Review**: Completed
- **Community Review**: Ongoing
- **External Audit**: Planned for Q2 2024

## Two-Factor Authentication (2FA)

RenVault implements comprehensive 2FA security features to protect user accounts and transactions.

### Features
- **TOTP-based 2FA**: Time-based One-Time Passwords using authenticator apps
- **Backup Codes**: Single-use recovery codes for account access
- **Secure Storage**: Client-side encryption of 2FA secrets
- **Rate Limiting**: Protection against brute force attacks
- **Session Security**: Automatic logout and secure session management

### Setup Process
1. User initiates 2FA setup from security settings
2. System generates secret and QR code
3. User scans QR code with authenticator app
4. User verifies setup with initial code
5. System generates and displays backup codes
6. User securely stores backup codes

### API Endpoints
- `POST /api/2fa/generate` - Generate 2FA secret
- `POST /api/2fa/verify` - Verify 2FA code
- `POST /api/2fa/backup-codes` - Generate backup codes
- `POST /api/2fa/verify-backup` - Verify backup code
- `GET /api/2fa/status/:userId` - Check 2FA status

### Security Best Practices
- Rate limiting on all 2FA endpoints (5 attempts per 5 minutes)
- Input validation and sanitization
- Content Security Policy (CSP) headers
- HTTPS-only communication
- Secure session management
- Automatic cleanup of sensitive data

### Backup Codes
- Generated during 2FA setup
- Single-use codes for account recovery
- Secure storage recommended (password manager, safe)
- Automatic invalidation after use

### Session Management
- Secure logout clears all session data
- 2FA verification required for sensitive operations
- Automatic session timeout
- Cross-device session management

### Responsible Disclosure

We follow responsible disclosure practices:

1. **Report**: Submit vulnerability report
2. **Acknowledge**: We acknowledge receipt within 48 hours
3. **Investigate**: We investigate and develop fixes
4. **Coordinate**: We coordinate disclosure timeline
5. **Publish**: We publish security advisory after fix