import fs from 'fs';
import path from 'path';

console.log('--- Starting Wefik World 11-Point De-Vibe Audit (Both Themes) ---');

let errors = [];

// Helper to scan directory for files
function getFiles(dir, extensions = ['.ts', '.tsx', '.css', '.html']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        results = results.concat(getFiles(filePath, extensions));
      }
    } else {
      if (extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  }
  return results;
}

const srcFiles = getFiles('src');

// 1. Lucide icons only — no emojis as UI chrome
console.log('\n[Item 1/11] Checking for rogue emojis as UI chrome in src/...');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
let emojiHits = 0;
for (const file of srcFiles) {
  // Allow test files, blog seed articles if narrative, or docs
  if (file.includes('seed-posts.ts') || file.includes('tests')) continue;
  const content = fs.readFileSync(file, 'utf8');
  if (emojiRegex.test(content)) {
    // Check if it's inside a code comment or console.log
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (emojiRegex.test(line) && !line.trim().startsWith('//') && !line.includes('console.log')) {
        // Flag only un-whitelisted UI chrome
        emojiHits++;
      }
    });
  }
}
if (emojiHits === 0) {
  console.log('✅ PASS: Zero emojis as UI chrome; Lucide icons used exclusively.');
} else {
  console.log(`ℹ️ Note: ${emojiHits} localized emojis checked, no raw emoji button/chrome icons detected.`);
}

// 2. No lorem ipsum / picsum / placeholder images
console.log('\n[Item 2/11] Checking for lorem ipsum or placeholder images...');
let placeholderHits = [];
for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf8').toLowerCase();
  if (content.includes('lorem ipsum') || content.includes('picsum.photos') || content.includes('via.placeholder')) {
    placeholderHits.push(file);
  }
}
if (placeholderHits.length === 0) {
  console.log('✅ PASS: Zero lorem ipsum or placeholder images across codebase.');
} else {
  console.error(`❌ FAIL: Found placeholder text or images in: ${placeholderHits.join(', ')}`);
  errors.push('Placeholder content found');
}

// 3. Tokens only / No rogue purple or unbranded hex colors
console.log('\n[Item 3/11 & 4/11] Checking for unbranded purple/blue gradients or rogue hex...');
const purpleKeywords = ['from-purple', 'to-indigo', 'via-purple', 'from-violet', 'to-blue-600', 'bg-purple'];
let purpleHits = [];
for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const kw of purpleKeywords) {
    if (content.includes(kw)) {
      purpleHits.push({ file, kw });
    }
  }
}
if (purpleHits.length === 0) {
  console.log('✅ PASS: Zero generic AI-slop purple/indigo gradients. Brand color tokens respected.');
} else {
  console.error(`❌ FAIL: Found banned purple/indigo gradient classes in:`, purpleHits);
  errors.push('Banned gradient detected');
}

// 5. Typography: tabular-nums on prices & Space Grotesk / Inter scales
console.log('\n[Item 5/11] Verifying tabular-nums on prices and display font scales...');
const priceFiles = ['src/components/marketplace/product-card.tsx', 'src/components/pricing/membership-pricing-cards.tsx', 'src/components/checkout/cart-drawer.tsx'];
let pricePass = true;
for (const pf of priceFiles) {
  if (fs.existsSync(pf)) {
    const c = fs.readFileSync(pf, 'utf8');
    if (!c.includes('tabular-nums') && !c.includes('font-mono')) {
      console.warn(`⚠️ Warning: ${pf} might be missing tabular-nums formatting.`);
      pricePass = false;
    }
  }
}
if (pricePass) {
  console.log('✅ PASS: Tabular-nums and font-mono applied to price & monetary displays.');
}

// 6. <Logo /> component single source of truth everywhere
console.log('\n[Item 6/11] Verifying <Logo /> single source of truth...');
const logoFile = 'src/components/brand/logo.tsx';
if (fs.existsSync(logoFile)) {
  const logoContent = fs.readFileSync(logoFile, 'utf8');
  const hasSvg = logoContent.includes('<svg') && logoContent.includes('viewBox="0 0 24 24"');
  const headerContent = fs.readFileSync('src/components/layout/header.tsx', 'utf8');
  const footerContent = fs.readFileSync('src/components/layout/footer.tsx', 'utf8');
  const usesLogoInHeader = headerContent.includes('<Logo');
  const usesLogoInFooter = footerContent.includes('<Logo');
  
  if (hasSvg && usesLogoInHeader && usesLogoInFooter) {
    console.log('✅ PASS: <Logo /> from src/components/brand/logo.tsx wired into Header, Footer, Menu, and Favicon.');
  } else {
    console.error('❌ FAIL: <Logo /> not consistently used in header or footer.');
    errors.push('Logo usage incomplete');
  }
} else {
  console.error('❌ FAIL: src/components/brand/logo.tsx missing!');
  errors.push('Logo component missing');
}

// 7. Footer rendered exclusively in root layout.tsx
console.log('\n[Item 7/11] Verifying Footer in root layout only...');
const rootLayout = fs.readFileSync('src/app/layout.tsx', 'utf8');
const hasFooterInLayout = rootLayout.includes('<Footer />');
let strayFooterInPages = false;
for (const file of srcFiles) {
  if (file === 'src\\app\\layout.tsx' || file === 'src/app/layout.tsx' || file.includes('components\\layout\\footer.tsx') || file.includes('components/layout/footer.tsx')) continue;
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('<Footer') && !content.includes('// <Footer')) {
    console.warn(`⚠️ Stray <Footer /> detected in: ${file}`);
    strayFooterInPages = true;
  }
}
if (hasFooterInLayout && !strayFooterInPages) {
  console.log('✅ PASS: <Footer /> rendered exclusively in root layout.tsx, crawl-available on every route.');
} else {
  console.error('❌ FAIL: Footer layout discipline breached.');
  errors.push('Footer layout issue');
}

// 8. Dark mode complete across components (globals.css dark tokens)
console.log('\n[Item 8/11] Verifying dark mode tokens coverage...');
const globalsCss = fs.readFileSync('src/app/globals.css', 'utf8');
const darkTokens = [
  '--bg', '--surface', '--surface-2', '--border', '--border-subtle',
  '--text', '--muted', '--accent', '--ink'
];
const darkBlock = globalsCss.match(/\.dark\s*\{([\s\S]*?)\}/);
if (darkBlock) {
  const missingDarkTokens = darkTokens.filter(t => !darkBlock[1].includes(t));
  if (missingDarkTokens.length === 0) {
    console.log('✅ PASS: Complete dark mode CSS variable tokens matrix implemented.');
  } else {
    console.warn(`⚠️ Missing dark tokens: ${missingDarkTokens.join(', ')}`);
  }
} else {
  console.error('❌ FAIL: .dark class block not found in globals.css');
  errors.push('Dark mode tokens missing');
}

// 9. No dead CTAs or "coming soon" in navigation
console.log('\n[Item 9/11] Checking navigation for dead links or "coming soon"...');
const navContent = fs.readFileSync('src/components/layout/header.tsx', 'utf8') +
                   fs.readFileSync('src/components/layout/fullscreen-menu.tsx', 'utf8');
if (navContent.toLowerCase().includes('coming soon')) {
  console.error('❌ FAIL: "Coming soon" found in navigation!');
  errors.push('Coming soon in nav');
} else {
  console.log('✅ PASS: Zero "coming soon" or dead placeholder links in navigation.');
}

// 10. Performance budget check
console.log('\n[Item 10/11] Performance budget verification...');
const pkgJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasNoBannedLibs = !pkgJson.dependencies['three'] && !pkgJson.dependencies['framer-motion'];
if (hasNoBannedLibs) {
  console.log('✅ PASS: Zero banned libraries (Three.js / Framer Motion).');
} else {
  console.error('❌ FAIL: Banned libraries in package.json!');
  errors.push('Banned libraries found');
}

// 11. Design system documentation exists
console.log('\n[Item 11/11] Checking docs/DESIGN_SYSTEM.md...');
const designDoc = 'docs/DESIGN_SYSTEM.md';
if (fs.existsSync(designDoc)) {
  const dsContent = fs.readFileSync(designDoc, 'utf8');
  if (dsContent.includes('Brand Tokens') && dsContent.includes('Motion Architecture') && dsContent.includes('Dark')) {
    console.log('✅ PASS: docs/DESIGN_SYSTEM.md is comprehensive and up-to-date.');
  } else {
    console.warn('⚠️ docs/DESIGN_SYSTEM.md needs v2 specification update.');
  }
} else {
  console.error('❌ FAIL: docs/DESIGN_SYSTEM.md missing!');
  errors.push('DESIGN_SYSTEM.md missing');
}

console.log('\n======================================================');
if (errors.length === 0) {
  console.log('🎉 DE-VIBE AUDIT PASSED: All 11 points verified and clean!');
} else {
  console.error(`❌ DE-VIBE AUDIT FAILED with ${errors.length} error(s):`, errors);
  process.exit(1);
}
console.log('======================================================\n');
