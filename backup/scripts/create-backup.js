const DataExporter = require('../dataExporter');

async function createBackup() {
  const exporter = new DataExporter();
  
  const knownUsers = [
    'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY'
  ];
  
  console.log('📦 Creating manual backup...');
  
  try {
    const filepath = await exporter.createFullBackup(knownUsers);
    console.log(`✅ Backup created successfully: ${filepath}`);
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  createBackup();
}

module.exports = { createBackup };