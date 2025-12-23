import * as fs from 'fs';
import * as path from 'path';

const envFile = path.join(__dirname, '../.env.local');
const envExampleFile = path.join(__dirname, '../.env.example');

const requiredVars = ['VITE_WALLETCONNECT_PROJECT_ID'];
const optionalVars = [
  'VITE_APP_NAME',
  'VITE_APP_DESCRIPTION',
  'VITE_APP_URL',
  'VITE_APP_ICON',
];

function validateEnv() {
  if (!fs.existsSync(envFile)) {
    console.error(`\n❌ Missing .env.local file`);
    console.log(`📝 Create one by copying from .env.example:`);
    console.log(`   cp .env.example .env.local`);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envFile, 'utf-8');
  const missing: string[] = [];

  requiredVars.forEach((varName) => {
    if (!envContent.includes(`${varName}=`)) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error(`\n❌ Missing required environment variables:`);
    missing.forEach((v) => console.error(`   - ${v}`));
    process.exit(1);
  }

  console.log(`✅ All required environment variables are set`);
  console.log(`✅ Environment validation passed`);
}

validateEnv();
