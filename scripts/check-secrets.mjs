import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('--- Running Pre-Commit Secret Scanner ---');

// Rules to detect unmasked API keys / secrets
const SECRET_PATTERNS = [
  { name: 'Razorpay Live Key', regex: /\brzp_live_[A-Za-z0-9]{14,}\b/ },
  { name: 'Stripe Live Secret Key', regex: /\bsk_live_[0-9a-zA-Z]{24,}\b/ },
  { name: 'AWS Access Key', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Private Key Block', regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'GitHub Personal Access Token', regex: /\bghp_[0-9a-zA-Z]{36}\b/ },
  { name: 'Resend API Key', regex: /\bre_[0-9a-zA-Z]{24,}\b/ },
  { name: 'Upstash Redis Token', regex: /\bAX[0-9a-zA-Z_-]{20,}\b/ },
];

// Files and paths to ignore
const IGNORED_PATHS = [
  'node_modules',
  '.git',
  '.next',
  '.env.example',
  'scripts/check-secrets.mjs',
  'package-lock.json',
];

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const relPath = filePath.replace(/\\/g, '/');
    if (IGNORED_PATHS.some((ignored) => relPath.includes(ignored))) {
      continue;
    }
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const filesToCheck = [
  ...getAllFiles('src'),
  ...getAllFiles('supabase/functions'),
  ...getAllFiles('scripts'),
  ...getAllFiles('tests'),
  ...getAllFiles('docs'),
  'package.json',
  'README.md',
  'PROGRESS.md',
  'BUILD_LOG.md',
].filter((f) => fs.existsSync(f));

let violations = [];

for (const filePath of filesToCheck) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(line)) {
          // Exclude comments that document regexes or tests
          if (line.includes('regex covers') || line.includes('pattern.regex')) continue;
          violations.push({
            file: filePath,
            line: index + 1,
            rule: pattern.name,
            snippet: line.trim().slice(0, 80),
          });
        }
      }
    });
  } catch (err) {
    // Binary or unreadable file
  }
}

if (violations.length > 0) {
  console.error('\n❌ SECRETS DETECTED IN CODEBASE:');
  for (const v of violations) {
    console.error(`  - ${v.file}:${v.line} [${v.rule}]`);
  }
  console.error('\nCommit blocked. Secrets must NEVER be committed to git.');
  console.error('Use environment variables (.env.local or Vercel) instead.\n');
  process.exit(1);
} else {
  console.log('✅ PASS: No secrets detected across audited files.');
  process.exit(0);
}
