#!/usr/bin/env node
// Security Audit CLI Tool
const { AuditRunner } = require('./auditRunner');
const { PenetrationTester } = require('./penetrationTest');
const { SecurityReportGenerator } = require('./securityReport');

class SecurityCLI {
  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'audit':
        await this.runAudit();
        break;
      case 'pentest':
        await this.runPenTest();
        break;
      case 'full':
        await this.runFullSecurity();
        break;
      default:
        this.showHelp();
    }
  }

  async runAudit() {
    console.log('Running security audit...');
    const runner = new AuditRunner();
    const results = await runner.auditProject();
    console.log(`Found ${results.summary.totalVulnerabilities} vulnerabilities`);
    return results;
  }

  async runPenTest() {
    console.log('Running penetration tests...');
    // Mock contract interface for testing
    const mockContract = { call: async () => ({ success: true }) };
    const tester = new PenetrationTester(mockContract);
    const results = await tester.runAllTests();
    console.log(`Security score: ${results.summary.securityScore}%`);
    return results;
  }

  async runFullSecurity() {
    const auditResults = await this.runAudit();
    const penTestResults = await this.runPenTest();
    
    const generator = new SecurityReportGenerator();
    const report = generator.generateReport(auditResults, penTestResults);
    const filename = generator.saveReport();
    
    console.log(`Full security report saved to ${filename}`);
    console.log(`Overall security score: ${report.executive_summary.overall_score}%`);
    console.log(`Risk level: ${report.executive_summary.risk_level}`);
  }

  showHelp() {
    console.log(`
RenVault Security Audit Tool

Usage:
  node cli.js audit     - Run static code analysis
  node cli.js pentest   - Run penetration tests  
  node cli.js full      - Run complete security audit

Options:
  --help               - Show this help message
    `);
  }
}

if (require.main === module) {
  new SecurityCLI().run().catch(console.error);
}

module.exports = { SecurityCLI };