const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IGNORES = ['node_modules', '.git', 'deployments'];

function walk(dir) {
  const results = [];
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (IGNORES.some(i => full.includes(i))) return;
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) results.push(...walk(full));
    else results.push(full);
  });
  return results;
}

const files = walk(ROOT).filter(f => f.endsWith('.js') || f.endsWith('.html') || f.endsWith('.ts'));
let found = [];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (/http:\\/\\/localhost|ws:\\/\\/localhost/.test(content)) {
    found.push(f);
  }
});

if (found.length) {
  console.error('Found hardcoded localhost occurrences in files:');
  found.forEach(f => console.error(' -', f));
  process.exit(2);
} else {
  console.log('No hardcoded localhost occurrences found.');
  process.exit(0);
}
