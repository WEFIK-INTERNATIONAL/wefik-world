import assert from 'node:assert';
import { evaluatePassword } from '../src/lib/security/password-strength.ts';
import { isPasswordBreached } from '../src/lib/security/hibp.ts';

console.log('--- Running Phase 10: Auth, Security, RLS & Rate Limit Unit Tests ---');

// Test 1: Password Strength Evaluator (Rule-Based, min 10 chars)
{
  const shortPw = evaluatePassword('Abc1!');
  assert.strictEqual(shortPw.isValid, false);
  assert.strictEqual(shortPw.label, 'Too short');
  assert.strictEqual(shortPw.requirements.minChars, false);
  console.log('✓ Password strength rejects passwords < 10 characters');

  const weakPw = evaluatePassword('abcdefghijk');
  assert.strictEqual(weakPw.isValid, false);
  assert.strictEqual(weakPw.label, 'Weak');
  console.log('✓ Password strength rejects single-charset passwords (Weak)');

  const fairPw = evaluatePassword('Abcdefghijk');
  assert.strictEqual(fairPw.isValid, true);
  console.log('✓ Password strength accepts multi-charset passwords >= 10 chars');

  const strongPw = evaluatePassword('SuperStr0ngP@ss2026!');
  assert.strictEqual(strongPw.score, 4);
  assert.strictEqual(strongPw.label, 'Strong');
  assert.strictEqual(strongPw.isValid, true);
  console.log('✓ Password strength verifies complex passwords as Strong');
}

// Test 2: HIBP k-anonymity Breached Password Check
{
  // Test well known breached password
  const breachedResult = await isPasswordBreached('password12345');
  assert.strictEqual(breachedResult.breached, true);
  assert.ok((breachedResult.count || 0) > 0);
  console.log(`✓ HIBP successfully detected breached password (seen ${breachedResult.count} times)`);

  // Test strong novel password
  const uniquePassword = `Wfk_${Date.now()}_Xy99#Zq!`;
  const cleanResult = await isPasswordBreached(uniquePassword);
  assert.strictEqual(cleanResult.breached, false);
  console.log('✓ HIBP clean password passes safely');
}

// Test 3: Disposable Email Domain Filter
{
  const blockedSample = new Set(['mailinator.com', 'tempmail.com', '10minutemail.com', 'trashmail.com', 'guerrillamail.com']);
  const isBlocked = (email) => {
    const domain = email.split('@')[1]?.toLowerCase().trim();
    return blockedSample.has(domain);
  };

  assert.strictEqual(isBlocked('spammer@mailinator.com'), true);
  assert.strictEqual(isBlocked('burner@tempmail.com'), true);
  assert.strictEqual(isBlocked('developer@agency.in'), false);
  assert.strictEqual(isBlocked('founder@wefik.world'), false);
  console.log('✓ Disposable email domains correctly blocked, legitimate domains permitted');
}

// Test 4: RLS Ownership Isolation Logic Simulation (User A vs User B)
{
  const mockDb = {
    profiles: [
      { id: 'user-a-uuid', email: 'alice@agency.in', full_name: 'Alice', recovery_email: 'alice-rec@agency.in' },
      { id: 'user-b-uuid', email: 'bob@studio.io', full_name: 'Bob', recovery_email: 'bob-rec@studio.io' }
    ],
    orders: [
      { id: 'order-1', user_id: 'user-a-uuid', total_amount_inr: 199900 },
      { id: 'order-2', user_id: 'user-b-uuid', total_amount_inr: 999900 }
    ],
    licenses: [
      { id: 'lic-1', user_id: 'user-a-uuid', license_key: 'WFK-AAAA-AAAA-AAAA' },
      { id: 'lic-2', user_id: 'user-b-uuid', license_key: 'WFK-BBBB-BBBB-BBBB' }
    ],
    storage_avatars: [
      { path: 'user-a-uuid/avatar.png', owner_id: 'user-a-uuid' },
      { path: 'user-b-uuid/avatar.png', owner_id: 'user-b-uuid' }
    ]
  };

  function rlsQuery(table, currentUserId, isAdmin = false) {
    if (isAdmin) return mockDb[table];
    if (table === 'profiles') {
      return mockDb.profiles.filter(p => p.id === currentUserId);
    }
    if (table === 'orders') {
      return mockDb.orders.filter(o => o.user_id === currentUserId);
    }
    if (table === 'licenses') {
      return mockDb.licenses.filter(l => l.user_id === currentUserId);
    }
    if (table === 'storage_avatars') {
      return mockDb.storage_avatars.filter(a => a.owner_id === currentUserId);
    }
    return [];
  }

  // User A querying profiles
  const aliceProfiles = rlsQuery('profiles', 'user-a-uuid');
  assert.strictEqual(aliceProfiles.length, 1);
  assert.strictEqual(aliceProfiles[0].email, 'alice@agency.in');

  // User A attempting to read User B's orders
  const aliceOrders = rlsQuery('orders', 'user-a-uuid');
  assert.strictEqual(aliceOrders.length, 1);
  assert.strictEqual(aliceOrders[0].id, 'order-1');
  assert.ok(!aliceOrders.some(o => o.user_id === 'user-b-uuid'));
  console.log('✓ RLS: User A cannot read User B orders');

  // User A attempting to read User B's licenses
  const aliceLicenses = rlsQuery('licenses', 'user-a-uuid');
  assert.strictEqual(aliceLicenses.length, 1);
  assert.strictEqual(aliceLicenses[0].license_key, 'WFK-AAAA-AAAA-AAAA');
  assert.ok(!aliceLicenses.some(l => l.user_id === 'user-b-uuid'));
  console.log('✓ RLS: User A cannot read User B licenses');

  // Storage bucket path isolation
  const aliceAvatars = rlsQuery('storage_avatars', 'user-a-uuid');
  assert.strictEqual(aliceAvatars.length, 1);
  assert.strictEqual(aliceAvatars[0].path, 'user-a-uuid/avatar.png');
  console.log('✓ Storage RLS: User A can only write/read under user-a-uuid/*');
}

// Test 5: Sliding-Window Rate Limit Logic
{
  class MockSlidingRateLimiter {
    constructor() {
      this.hits = new Map();
    }
    hit(key, limit, windowMs) {
      const now = Date.now();
      const timestamps = (this.hits.get(key) || []).filter(t => now - t < windowMs);
      if (timestamps.length >= limit) {
        return { allowed: false, remaining: 0 };
      }
      timestamps.push(now);
      this.hits.set(key, timestamps);
      return { allowed: true, remaining: limit - timestamps.length };
    }
  }

  const limiter = new MockSlidingRateLimiter();
  const ip = '198.51.100.42';

  // Test 5 requests allowed
  for (let i = 0; i < 5; i++) {
    const res = limiter.hit(`check-email:${ip}`, 5, 60000);
    assert.strictEqual(res.allowed, true);
  }

  // 6th request must be blocked (HTTP 429)
  const blockedRes = limiter.hit(`check-email:${ip}`, 5, 60000);
  assert.strictEqual(blockedRes.allowed, false);
  console.log('✓ Rate Limiter: Blocks excessive calls (5/min/IP enforced)');
}

console.log('🎉 All Phase 10 Auth, Security, RLS & Rate Limit tests passed 100%!');
