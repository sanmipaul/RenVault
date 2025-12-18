# Security Audit Tools

## Overview
Comprehensive security audit suite for RenVault smart contracts including vulnerability scanning, penetration testing, and automated reporting.

## Features
- **Vulnerability Scanner**: Static analysis for common Clarity vulnerabilities
- **Penetration Testing**: Dynamic security testing suite
- **Security Report Generator**: Comprehensive audit reporting
- **CLI Tool**: Command-line interface for security operations
- **Automated Auditing**: Continuous security monitoring

## Usage

### Quick Start
```bash
# Run full security audit
node security/cli.js full

# Run individual components
node security/cli.js audit    # Static analysis only
node security/cli.js pentest  # Penetration testing only
```

### Automation
```bash
# Run complete automated audit
node scripts/run-security-audit.js
```

## Security Checks
- Reentrancy protection
- Integer overflow/underflow
- Access control validation
- Input sanitization
- Contract interaction safety

## Report Format
- Executive summary with risk scores
- Detailed vulnerability findings
- Penetration test results
- Compliance status
- Remediation recommendations