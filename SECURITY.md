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

### Responsible Disclosure

We follow responsible disclosure practices:

1. **Report**: Submit vulnerability report
2. **Acknowledge**: We acknowledge receipt within 48 hours
3. **Investigate**: We investigate and develop fixes
4. **Coordinate**: We coordinate disclosure timeline
5. **Publish**: We publish security advisory after fix