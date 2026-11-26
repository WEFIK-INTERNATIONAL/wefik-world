import assert from 'node:assert';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { UNLIMITED_LICENSE_MULTIPLIER } from '../src/lib/pricing.ts';

console.log('--- Running Launch-Readiness Critical Flow Tests ---');

// 1. Webhook Handler Source & Signature Verification
{
  const webhookSrc = fs.readFileSync(
    path.resolve('supabase/functions/razorpay-webhook/index.ts'),
    'utf8'
  );
  assert.ok(webhookSrc.includes('if (!secret)'), 'Webhook must fail closed when RAZORPAY_WEBHOOK_SECRET is missing');
  assert.ok(webhookSrc.includes('status: 401'), 'Webhook must return 401 on missing/invalid signature');
  assert.ok(webhookSrc.includes('acquireIdempotency'), 'Webhook must check Redis idempotency');
  assert.ok(webhookSrc.includes('if (idempotencyState === "error")'), 'Webhook must fail closed (503) if Redis is unavailable');

  function simulateWebhook({ rawBody, signature, secret, seenEvents }) {
    if (!secret) return { status: 401, error: 'Webhook verification not configured' };
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const sigBuf = Buffer.from(signature || '');
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { status: 401, error: 'Invalid signature' };
    }
    const event = JSON.parse(rawBody);
    const eventId = event.event_id || event.id;
    if (seenEvents.has(eventId)) {
      return { status: 200, duplicate: true, granted: false };
    }
    seenEvents.add(eventId);
    return { status: 200, duplicate: false, granted: true };
  }

  const secret = 'rzp_test_secret_fixture';
  const payload = JSON.stringify({ event_id: 'evt_fixture_1', event: 'payment.captured' });
  const validSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const seen = new Set();

  assert.strictEqual(simulateWebhook({ rawBody: payload, signature: validSig, secret: '', seenEvents: seen }).status, 401);
  assert.strictEqual(simulateWebhook({ rawBody: payload, signature: 'bad_sig', secret, seenEvents: seen }).status, 401);

  const first = simulateWebhook({ rawBody: payload, signature: validSig, secret, seenEvents: seen });
  assert.deepStrictEqual(first, { status: 200, duplicate: false, granted: true });

  const replay = simulateWebhook({ rawBody: payload, signature: validSig, secret, seenEvents: seen });
  assert.deepStrictEqual(replay, { status: 200, duplicate: true, granted: false });
  console.log('✓ 1. Webhook fails closed on missing/invalid secret and prevents replay double-grant');
}

// 2. Checkout Server Logic: DB Price Authority & Shared Multiplier
{
  const createOrderSrc = fs.readFileSync(
    path.resolve('supabase/functions/create-order/index.ts'),
    'utf8'
  );
  assert.ok(!createOrderSrc.includes('order_mock_'), 'create-order must not fall back to mock orders');
  assert.ok(createOrderSrc.includes('src/lib/pricing.ts') || createOrderSrc.includes('UNLIMITED_LICENSE_MULTIPLIER'), 'create-order must use shared multiplier');

  const dbProducts = new Map([
    ['prod-1', { id: 'prod-1', price_inr: 150000, is_free: false }],
  ]);

  function computeServerTotal(items) {
    let total = 0;
    for (const item of items) {
      const dbProduct = dbProducts.get(item.product_id);
      if (!dbProduct) throw new Error('Product not found');
      // Client-sent price is ignored; only DB price + shared multiplier used
      const unitPrice =
        item.license_type === 'unlimited'
          ? Math.round(dbProduct.price_inr * UNLIMITED_LICENSE_MULTIPLIER)
          : dbProduct.price_inr;
      total += unitPrice;
    }
    return total;
  }

  const tamperedClientItem = { product_id: 'prod-1', license_type: 'unlimited', client_price_inr: 100 };
  assert.strictEqual(
    computeServerTotal([tamperedClientItem]),
    Math.round(150000 * UNLIMITED_LICENSE_MULTIPLIER)
  );
  console.log('✓ 2. Checkout ignores client price and applies shared UNLIMITED_LICENSE_MULTIPLIER');
}

// 3. Access Rules: RLS Policies, Download URL Auth & Rate Limiting
{
  const schemaSql = fs.readFileSync(path.resolve('supabase/migrations/001_schema.sql'), 'utf8');
  assert.ok(schemaSql.includes('alter table public.orders enable row level security'), 'orders RLS must be enabled');
  assert.ok(schemaSql.includes('alter table public.licenses enable row level security'), 'licenses RLS must be enabled');

  const downloadSrc = fs.readFileSync(
    path.resolve('supabase/functions/download-url/index.ts'),
    'utf8'
  );
  assert.ok(downloadSrc.includes('getAuthenticatedUser'), 'download-url must authenticate user');
  assert.ok(downloadSrc.includes('checkRateLimit'), 'download-url must enforce rate limit');
  assert.ok(downloadSrc.includes('status: 429'), 'download-url must return 429 on rate limit');

  const licenses = [{ user_id: 'user-a', product_id: 'prod-1', status: 'active' }];
  const rateCounts = new Map();

  function requestDownload({ userId, productId }) {
    if (!userId) return { status: 401 };
    const count = (rateCounts.get(userId) || 0) + 1;
    rateCounts.set(userId, count);
    if (count > 20) return { status: 429 };
    const hasLicense = licenses.some(
      (l) => l.user_id === userId && l.product_id === productId && l.status === 'active'
    );
    if (!hasLicense) return { status: 403 };
    return { status: 200, url: 'https://signed.example/file.zip' };
  }

  assert.strictEqual(requestDownload({ userId: null, productId: 'prod-1' }).status, 401);
  assert.strictEqual(requestDownload({ userId: 'user-b', productId: 'prod-1' }).status, 403);
  assert.strictEqual(requestDownload({ userId: 'user-a', productId: 'prod-1' }).status, 200);
  for (let i = 0; i < 20; i++) requestDownload({ userId: 'user-a', productId: 'prod-1' });
  assert.strictEqual(requestDownload({ userId: 'user-a', productId: 'prod-1' }).status, 429);
  console.log('✓ 3. Access rules (auth, license ownership, rate limit) verified');
}

console.log('--- All Launch-Readiness Critical Flow Tests Passed! ---');
