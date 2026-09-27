/**
 * AI Engine Dual-Verification Test (Gemini Primary -> Groq Fallback)
 * Tests live generation on both engines without exposing secrets.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const geminiKey = process.env.GEMINI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

if (!geminiKey) {
  console.error('❌ FAIL: GEMINI_API_KEY is not set in .env.local');
  process.exit(1);
}

if (!groqKey) {
  console.error('❌ FAIL: GROQ_API_KEY is not set in .env.local');
  process.exit(1);
}

console.log('--- Running AI Engine Live Dry-Run Tests ---');
console.log(`[+] Blind presence check: GEMINI_API_KEY length: ${geminiKey.length}`);
console.log(`[+] Blind presence check: GROQ_API_KEY length: ${groqKey.length}`);

async function testGemini() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Write one short sentence about WordPress child themes.' }] }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini returned status ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || text.trim().length === 0) {
    throw new Error('Gemini returned empty text');
  }
  return text.trim();
}

async function testGroq() {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'wefik-test/1.0',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: 'Write one short sentence about WordPress child themes.' }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq returned status ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text || text.trim().length === 0) {
    throw new Error('Groq returned empty text');
  }
  return text.trim();
}

async function run() {
  try {
    // 1. Test Gemini Primary
    const geminiText = await testGemini();
    console.log(`✓ 1. Primary Engine (Gemini Flash) verified: "${geminiText.slice(0, 70)}..."`);

    // 2. Test Groq Fallback
    const groqText = await testGroq();
    console.log(`✓ 2. Fallback Engine (Groq / gpt-oss-120b) verified: "${groqText.slice(0, 70)}..."`);

    console.log('🎉 All AI Engine checks passed 100%!');
  } catch (err) {
    console.error('❌ AI Verification Test Failed:', err);
    process.exit(1);
  }
}

run();
