// Security Report Generator
const fs = require('fs');

class SecurityReportGenerator {
  constructor() {
    this.reportData = {};
  }

  generateReport(auditResults, penTestResults) {
    this.reportData = {
      timestamp: new Date().toISOString(),
      audit: auditResults,
      penetrationTest: penTestResults,
      overallScore: this.calculateOverallScore(auditResults, penTestResults),
      riskLevel: this.determineRiskLevel(auditResults, penTestResults)
    };

    return this.formatReport();
  }

  calculateOverallScore(audit, penTest) {
    const auditScore = Math.max(0, 100 - (audit.summary.maxRiskScore * 2));
    const penTestScore = parseFloat(penTest.summary.securityScore);
    return ((auditScore + penTestScore) / 2).toFixed(1);
  }

  determineRiskLevel(audit, penTest) {
    const score = this.calculateOverallScore(audit, penTest);
    if (score >= 90) return 'LOW';
    if (score >= 70) return 'MEDIUM';
    return 'HIGH';
  }

  formatReport() {
    return {
      executive_summary: {
        overall_score: this.reportData.overallScore,
        risk_level: this.reportData.riskLevel,
        total_vulnerabilities: this.reportData.audit.summary.totalVulnerabilities,
        successful_attacks: this.reportData.penetrationTest.summary.successfulAttacks
      },
      detailed_findings: {
        static_analysis: this.reportData.audit.details,
        dynamic_testing: this.reportData.penetrationTest.attacks
      },
      recommendations: this.consolidateRecommendations(),
      compliance_status: this.checkCompliance()
    };
  }

  consolidateRecommendations() {
    const auditRecs = this.reportData.audit.recommendations || [];
    const penTestRecs = this.reportData.penetrationTest.recommendations || [];
    return [...new Set([...auditRecs, ...penTestRecs])];
  }

  checkCompliance() {
    return {
      clarity_best_practices: this.reportData.overallScore > 80,
      defi_security_standards: this.reportData.riskLevel !== 'HIGH',
      audit_requirements: this.reportData.audit.summary.totalVulnerabilities < 5
    };
  }

  saveReport(filename = 'security-report.json') {
    fs.writeFileSync(filename, JSON.stringify(this.reportData, null, 2));
    return filename;
  }
}

module.exports = { SecurityReportGenerator };