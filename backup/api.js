const express = require('express');
const DataExporter = require('./dataExporter');
const RecoveryManager = require('./recoveryManager');
const BackupScheduler = require('./scheduler');

const app = express();
const exporter = new DataExporter();
const recovery = new RecoveryManager();
const scheduler = new BackupScheduler();

app.use(express.json());

app.post('/api/backup/create', async (req, res) => {
  const { userAddresses } = req.body;
  
  if (!userAddresses || !Array.isArray(userAddresses)) {
    return res.status(400).json({ error: 'User addresses array required' });
  }

  try {
    const filepath = await exporter.createFullBackup(userAddresses);
    res.json({ success: true, filepath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/backup/list', (req, res) => {
  try {
    const backups = recovery.listBackups();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/backup/report/:filename', (req, res) => {
  try {
    const backup = recovery.loadBackup(req.params.filename);
    const report = recovery.generateRecoveryReport(backup);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/backup/schedule/start', (req, res) => {
  const { userAddresses, intervalHours } = req.body;
  
  if (userAddresses) {
    scheduler.addUsers(userAddresses);
  }
  
  scheduler.start(intervalHours || 24);
  res.json({ success: true, message: 'Backup scheduler started' });
});

app.post('/api/backup/schedule/stop', (req, res) => {
  scheduler.stop();
  res.json({ success: true, message: 'Backup scheduler stopped' });
});

app.get('/api/backup/schedule/status', (req, res) => {
  const status = scheduler.getStatus();
  res.json(status);
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`💾 Backup API running on port ${PORT}`);
});

module.exports = app;