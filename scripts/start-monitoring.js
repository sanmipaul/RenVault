const ProtocolMonitor = require('../monitoring/monitor');

const monitor = new ProtocolMonitor();

console.log('🚀 Starting RenVault monitoring system...');
monitor.start(30000);

process.on('SIGINT', () => {
  monitor.stop();
  process.exit(0);
});