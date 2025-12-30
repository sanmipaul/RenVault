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

// Wallet Backup Endpoints
app.post('/api/wallet/backup', async (req, res) => {
  const { userId, encryptedBackup } = req.body;
  
  if (!userId || !encryptedBackup) {
    return res.status(400).json({ error: 'User ID and encrypted backup required' });
  }

  try {
    // Store encrypted backup securely
    const filename = `wallet-backup-${userId}-${Date.now()}.enc`;
    const filepath = path.join(__dirname, 'wallet-backups', filename);
    
    if (!fs.existsSync(path.dirname(filepath))) {
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
    }
    
    fs.writeFileSync(filepath, encryptedBackup);
    
    res.json({ success: true, filename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wallet/backup/:userId', (req, res) => {
  const { userId } = req.params;
  
  try {
    const backupDir = path.join(__dirname, 'wallet-backups');
    if (!fs.existsSync(backupDir)) {
      return res.json({ backups: [] });
    }
    
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith(`wallet-backup-${userId}-`))
      .map(file => {
        const filepath = path.join(backupDir, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime
        };
      })
      .sort((a, b) => b.created - a.created);
    
    res.json({ backups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wallet/backup/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, 'wallet-backups', filename);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Backup not found' });
  }
  
  res.download(filepath);
});

// Multi-Signature Wallet Endpoints
app.post('/api/multisig/setup', (req, res) => {
  const { userId, threshold, coSigners } = req.body;
  
  if (!userId || !threshold || !coSigners || !Array.isArray(coSigners)) {
    return res.status(400).json({ error: 'Invalid multi-sig setup data' });
  }

  try {
    const multiSigData = {
      userId,
      threshold,
      coSigners,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    const filename = `multisig-${userId}.json`;
    const filepath = path.join(__dirname, 'multisig-wallets', filename);
    
    if (!fs.existsSync(path.dirname(filepath))) {
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify(multiSigData, null, 2));
    
    res.json({ success: true, multiSigData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/multisig/:userId', (req, res) => {
  const { userId } = req.params;
  
  try {
    const filepath = path.join(__dirname, 'multisig-wallets', `multisig-${userId}.json`);
    
    if (!fs.existsSync(filepath)) {
      return res.json({ multiSig: null });
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    res.json({ multiSig: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/multisig/transaction', (req, res) => {
  const { userId, transaction, signatures } = req.body;
  
  if (!userId || !transaction || !signatures) {
    return res.status(400).json({ error: 'Invalid transaction data' });
  }

  try {
    const txData = {
      userId,
      transaction,
      signatures,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    const filename = `multisig-tx-${Date.now()}.json`;
    const filepath = path.join(__dirname, 'multisig-transactions', filename);
    
    if (!fs.existsSync(path.dirname(filepath))) {
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify(txData, null, 2));
    
    res.json({ success: true, txId: filename.replace('.json', '') });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/multisig/transactions/:userId', (req, res) => {
  const { userId } = req.params;
  
  try {
    const txDir = path.join(__dirname, 'multisig-transactions');
    if (!fs.existsSync(txDir)) {
      return res.json({ transactions: [] });
    }
    
    const transactions = fs.readdirSync(txDir)
      .filter(file => file.startsWith('multisig-tx-'))
      .map(file => {
        const filepath = path.join(txDir, file);
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        return data;
      })
      .filter(tx => tx.userId === userId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`💾 Backup API running on port ${PORT}`);
});

module.exports = app;