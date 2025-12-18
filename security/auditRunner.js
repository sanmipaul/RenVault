// Security Audit Runner
const fs = require('fs');
const path = require('path');
const { VulnerabilityScanner } = require('./vulnerabilityScanner');

class AuditRunner {
  constructor() {
    this.scanner = new VulnerabilityScanner();
    this.results = {};
  }

  async auditProject(contractsDir = './contracts') {
    const contracts = this.getContractFiles(contractsDir);
    
    for (const contract of contracts) {
      const code = fs.readFileSync(contract, 'utf8');
      const vulnerabilities = this.scanner.scanContract(code);
      this.results[contract] = {
        vulnerabilities,
        riskScore: this.calculateRiskScore(vulnerabilities),
        timestamp: new Date().toISOString()
      };
    }

    return this.generateReport();
  }

  getContractFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        files.push(...this.getContractFiles(fullPath));
      } else if (item.endsWith('.clar')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  calculateRiskScore(vulnerabilities) {
    const weights = { HIGH: 10, MEDIUM: 5, LOW: 1 };
    return vulnerabilities.reduce((score, vuln) => score + weights[vuln.severity], 0);
  }

  generateReport() {
    const totalVulns = Object.values(this.results).reduce((sum, r) => sum + r.vulnerabilities.length, 0);
    const maxRisk = Math.max(...Object.values(this.results).map(r => r.riskScore));
    
    return {
      summary: { totalVulnerabilities: totalVulns, maxRiskScore: maxRisk },
      details: this.results,
      recommendations: this.getRecommendations()
    };
  }

  getRecommendations() {
    return [
      'Add comprehensive input validation',
      'Implement proper access controls',
      'Use safe arithmetic operations',
      'Add reentrancy protection'
    ];
  }
}

module.exports = { AuditRunner };