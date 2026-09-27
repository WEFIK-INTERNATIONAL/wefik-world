import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BROWSER_PATH = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve('internal/qa/fix05/responsive');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'marketplace', path: '/marketplace' },
  { name: 'product', path: '/products/agencypro-theme' },
  { name: 'pricing', path: '/pricing' },
  { name: 'blog', path: '/blog' },
  { name: 'post', path: '/blog/the-complete-guide-to-choosing-a-wordpress-theme-2026' },
  { name: 'faqs', path: '/faqs' },
  { name: 'login', path: '/login' },
  { name: 'account', path: '/account' },
  { name: 'notfound', path: '/_not-found' },
];

const VIEWPORTS = [
  { width: 360, height: 740 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendCdpCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 100000);
    const handler = (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) {
          ws.off('message', handler);
          if (msg.error) reject(new Error(JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      } catch (err) {
        reject(err);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function main() {
  console.log('=== Starting Fix Pack 05 Part B Overflow & Responsive Audit ===');
  console.log(`Using Browser: ${BROWSER_PATH}`);
  console.log(`Target: ${BASE_URL}\n`);

  const browserProc = spawn(
    BROWSER_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--mute-audio',
      '--user-data-dir=' + path.resolve('.tmp-browser-profile'),
    ],
    { stdio: 'ignore' }
  );

  let versionData = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://localhost:9222/json/version');
      if (res.ok) {
        versionData = await res.json();
        break;
      }
    } catch {
      await sleep(300);
    }
  }

  if (!versionData) {
    console.error('Failed to connect to browser CDP port 9222');
    browserProc.kill();
    process.exit(1);
  }

  const newTabRes = await fetch('http://localhost:9222/json/new?' + encodeURIComponent('about:blank'), {
    method: 'PUT',
  });
  const tabData = await newTabRes.json();
  const ws = new WebSocket(tabData.webSocketDebuggerUrl);

  await new Promise((resolve) => ws.once('open', resolve));
  await sendCdpCommand(ws, 'Page.enable');
  await sendCdpCommand(ws, 'DOM.enable');

  let totalTests = 0;
  let passedTests = 0;
  const issues = [];

  for (const page of PAGES) {
    console.log(`\n📄 Testing Page: ${page.name} (${page.path})`);

    for (const vp of VIEWPORTS) {
      totalTests++;
      // Set device emulation
      await sendCdpCommand(ws, 'Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 1024,
      });

      // Navigate
      await sendCdpCommand(ws, 'Page.navigate', { url: `${BASE_URL}${page.path}` });
      await sleep(vp.width < 768 ? 700 : 500);

      // Measure overflow
      const evalRes = await sendCdpCommand(ws, 'Runtime.evaluate', {
        expression: `
          (() => {
            const scrollW = document.documentElement.scrollWidth;
            const innerW = window.innerWidth;
            const overflow = scrollW > innerW;
            let culprits = [];
            if (overflow) {
              const all = document.querySelectorAll('*');
              for (const el of all) {
                const rect = el.getBoundingClientRect();
                if (rect.right > innerW + 1) {
                  culprits.push({
                    tag: el.tagName.toLowerCase(),
                    className: (el.className || '').toString().slice(0, 80),
                    right: Math.round(rect.right),
                    width: Math.round(rect.width)
                  });
                  if (culprits.length >= 3) break;
                }
              }
            }
            return { scrollW, innerW, overflow, culprits };
          })()
        `,
        returnByValue: true,
      });

      const result = evalRes.result?.value || {};
      const statusIcon = result.overflow ? '❌ OVERFLOW' : '✅ PASS';

      if (result.overflow) {
        console.log(`   [${vp.width}px] ${statusIcon}: scrollWidth=${result.scrollW}px > innerWidth=${result.innerW}px`);
        issues.push({ page: page.name, viewport: vp.width, culprits: result.culprits });
      } else {
        passedTests++;
        console.log(`   [${vp.width}px] ${statusIcon}: scrollWidth=${result.scrollW}px === innerWidth=${result.innerW}px`);
      }

      // Save key screenshots for acceptance
      if (vp.width === 390 || vp.width === 768 || vp.width === 1440) {
        const screenshotData = await sendCdpCommand(ws, 'Page.captureScreenshot', { format: 'png' });
        const filePath = path.join(OUT_DIR, `${page.name}-${vp.width}.png`);
        fs.writeFileSync(filePath, Buffer.from(screenshotData.data, 'base64'));
      }
    }
  }

  ws.close();
  browserProc.kill();

  try {
    fs.rmSync(path.resolve('.tmp-browser-profile'), { recursive: true, force: true });
  } catch {}

  console.log('\n======================================================');
  console.log(`Audit Complete: ${passedTests}/${totalTests} viewport tests passed.`);
  if (issues.length === 0) {
    console.log('🎉 ZERO horizontal overflow detected across all pages & viewports!');
    console.log(`Screenshots saved to ${OUT_DIR}`);
    process.exit(0);
  } else {
    console.error('Detected overflow issues:', JSON.stringify(issues, null, 2));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
