#!/usr/bin/env node
/**
 * scripts/lint-theme-colors.mjs
 *
 * CI color guard script: Scans files in src/ for unthemed hard-coded `bg-white`
 * class names that break dark mode.
 *
 * Excludes intentional/safe patterns:
 * - `dark:bg-white` (intentional dark inversion)
 * - `bg-white/\d+` (translucent overlays like bg-white/10)
 * - non-code files / comments
 */

import { readdirSync, statSync, readFileSync } from 'fs';
import { resolve, join, extname } from 'path';

const SRC_DIR = resolve(process.cwd(), 'src');
const CODE_EXTS = new Set(['.tsx', '.ts', '.jsx', '.js']);

// Matches "bg-white" when NOT preceded by "dark:" or a word char, and NOT followed by "/" or word chars
const ROGUE_BG_WHITE_REGEX = /(?<!dark:)(?<![\w-])bg-white(?![\w/-])/g;

function getFiles(dir) {
  let results = [];
  const list = readdirSync(dir);
  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else if (CODE_EXTS.has(extname(filePath))) {
      results.push(filePath);
    }
  }
  return results;
}

function lint() {
  console.log('🎨 Scanning src/ for rogue unthemed bg-white tokens...');
  const files = getFiles(SRC_DIR);
  const violations = [];

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      // Skip pure comments
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        return;
      }

      if (ROGUE_BG_WHITE_REGEX.test(line)) {
        violations.push({
          file: file.replace(process.cwd() + '/', ''),
          lineNum: idx + 1,
          line: trimmed,
        });
      }
      // reset regex state
      ROGUE_BG_WHITE_REGEX.lastIndex = 0;
    });
  }

  if (violations.length > 0) {
    console.error(`\n❌ Found ${violations.length} rogue unthemed 'bg-white' occurrence(s):`);
    for (const v of violations) {
      console.error(`   ${v.file}:${v.lineNum} -> ${v.line}`);
    }
    console.error(`\nReplace 'bg-white' with 'bg-[var(--surface)]', 'bg-[var(--surface-2)]', or 'bg-[var(--bg)]'.`);
    process.exit(1);
  }

  console.log(`✅ Theme color check passed! Zero rogue bg-white tokens found across ${files.length} source files.`);
  process.exit(0);
}

lint();
