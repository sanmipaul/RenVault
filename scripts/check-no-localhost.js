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
const found = [];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const localhostMatch = line.match(/https?:\/\/localhost(:\d+)?/g);
    if (localhostMatch) {
      found.push({ file: f, line: idx + 1, matches: localhostMatch });
    }
  });
});

if (found.length) {
  console.error('Found hardcoded localhost occurrences:');
  found.forEach(({ file, line, matches }) => {
    console.error(`  ${file}:${line} -> ${matches.join(', ')}`);
  });
  process.exit(2);
} else {
  console.log('No hardcoded localhost occurrences found.');
  process.exit(0);
}
