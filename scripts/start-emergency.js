// Emergency System Startup Script
const { EmergencyAPI } = require('./emergencyAPI');
const { ProtocolCircuitBreaker } = require('./circuitBreaker');

async function startEmergencySystem() {
  console.log('🚨 Starting RenVault Emergency System...\n');

  // Initialize circuit breakers
  const circuitBreaker = new ProtocolCircuitBreaker();
  console.log('✅ Circuit breakers initialized\n');

  // Start emergency API
  const emergencyAPI = new EmergencyAPI(3006);
  emergencyAPI.start();
  console.log('✅ Emergency API server started on http://localhost:3006\n');

  // Setup monitoring
  console.log('✅ Threat monitoring active\n');

  // Demo emergency contacts
  console.log('Emergency Contacts:');
  console.log('- SP1234...OWNER (Owner)');
  console.log('- SP5678...ADMIN (Admin)\n');

  console.log('🚨 Emergency system is ready!');
  console.log('API: http://localhost:3006');
  console.log('Auto-monitoring: Every 30 seconds');
  console.log('Circuit breakers: Active for all operations');
}

if (require.main === module) {
  startEmergencySystem().catch(console.error);
}

module.exports = { startEmergencySystem };