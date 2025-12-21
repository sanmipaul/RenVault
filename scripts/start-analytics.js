// Analytics Dashboard Startup Script
const { DashboardServer } = require('./dashboardServer');
const { AnalyticsUpdater } = require('./analyticsUpdater');

async function startAnalyticsDashboard() {
  console.log('🚀 Starting RenVault Analytics Dashboard...\n');

  // Start dashboard server
  const dashboard = new DashboardServer(3001);
  dashboard.start();
  console.log('✅ Dashboard server started on http://localhost:3001\n');

  // Start real-time updater
  const updater = new AnalyticsUpdater();
  updater.startWebSocketServer(8080);
  console.log('✅ WebSocket server started on port 8080\n');

  // Start event simulation for demo
  updater.simulateEvents();
  console.log('✅ Event simulation started\n');

  console.log('📊 Analytics dashboard is ready!');
  console.log('Visit http://localhost:3001 to view analytics');
}

if (require.main === module) {
  startAnalyticsDashboard().catch(console.error);
}

module.exports = { startAnalyticsDashboard };