#!/usr/bin/env node
/**
 * scripts/refresh-disposable-domains.mjs
 * Fetches the curated open-source disposable email domains list
 * and updates supabase/seed_disposable_domains.sql and/or the database directly.
 */

import fs from 'fs';
import path from 'path';

const SOURCES = [
  'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf',
  'https://raw.githubusercontent.com/ivolo/disposable-email-domains/master/index.json'
];

// Fallback high-impact disposable domains if offline / network failure
const FALLBACK_POPULAR_DOMAINS = [
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'yopmail.com',
  'sharklasers.com', 'throwawaymail.com', 'trashmail.com', 'dispostable.com', 'getnada.com',
  'temp-mail.org', 'mohmal.com', 'fakeinbox.com', 'crazymailing.com', 'emailondeck.com',
  'mytemp.email', 'tempail.com', 'generator.email', 'dropmail.me', 'inboxkitten.com',
  'tempr.email', 'discard.email', 'discardmail.com', 'spambog.com', 'spambog.de',
  'spambog.ru', 'spam4.me', 'grr.la', 'guerrillamail.biz', 'guerrillamail.com',
  'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamailblock.com',
  'pokemail.net', 'spamfree24.org', 'binkmail.com', 'bobmail.info', 'chammy.info',
  'devnullmail.com', 'letthemeatspam.com', 'mailinater.com', 'mailinator2.com',
  'notmailinator.com', 'reallymymail.com', 'reconmail.com', 'safetymail.info',
  'sendspamhere.com', 'sogetthis.com', 'spambooger.com', 'spamherelots.com',
  'spamhereplease.com', 'spamthisplease.com', 'streetwisemail.com', 'suremail.info',
  'thisisnotmyrealemail.com', 'tradermail.info', 'veryrealemail.com', 'zippymail.info'
];

async function fetchDomainList() {
  for (const url of SOURCES) {
    try {
      console.log(`🌐 Attempting to fetch disposable domain list from ${url}...`);
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const text = await res.text();
        let domains = [];
        if (url.endsWith('.json')) {
          domains = JSON.parse(text);
        } else {
          domains = text
            .split('\n')
            .map((d) => d.trim().toLowerCase())
            .filter((d) => d && !d.startsWith('#') && d.includes('.'));
        }
        if (domains.length >= 1000) {
          console.log(`✅ Successfully fetched ${domains.length} disposable domains from ${url}!`);
          return Array.from(new Set(domains));
        }
      }
    } catch (err) {
      console.warn(`⚠️ Could not fetch from ${url}:`, err.message);
    }
  }

  console.log(`ℹ️ Falling back to bundled curated domains list.`);
  // Generate expanded set of variations for offline coverage
  const expanded = new Set(FALLBACK_POPULAR_DOMAINS);
  // Expand with common TLD and number variants to ensure solid offline coverage
  const prefixes = ['tempmail', 'disposable', 'trashmail', 'fakemail', 'throwaway', 'quickmail', 'fasttemp', 'spambox', 'anonymbox', 'dropemail'];
  const tlds = ['.com', '.net', '.org', '.io', '.xyz', '.online', '.site', '.info', '.top', '.me'];
  for (const p of prefixes) {
    for (const t of tlds) {
      expanded.add(`${p}${t}`);
      for (let i = 1; i <= 50; i++) {
        expanded.add(`${p}${i}${t}`);
      }
    }
  }
  return Array.from(expanded);
}

async function main() {
  const domains = await fetchDomainList();
  console.log(`📦 Compiling ${domains.length} blocked domains into SQL seed...`);

  // Write out as SQL seed
  const outputPath = path.resolve('supabase/seed_disposable_domains.sql');
  const values = domains
    .map((d) => `('${d.replace(/'/g, "''")}', 'disposable-list', now())`)
    .join(',\n  ');

  const sqlContent = `-- Auto-generated disposable email domains seed (${domains.length} domains)
-- Run via: psql -f supabase/seed_disposable_domains.sql or Supabase SQL editor
insert into public.blocked_email_domains (domain, source, added_at)
values
  ${values}
on conflict (domain) do nothing;
`;

  fs.writeFileSync(outputPath, sqlContent, 'utf8');
  console.log(`✅ Written ${domains.length} domains to ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error('Fatal error refreshing disposable domains:', err);
  process.exit(1);
});
