import crypto from 'crypto';
import assert from 'assert';

console.log('--- Running Edge Function Logic Unit Tests ---');

// 1. License Key Generator Test
function generateLicenseKey() {
  const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const segment = (len = 4) => {
    const bytes = crypto.randomBytes(len);
    let result = '';
    for (let i = 0; i < len; i++) {
      result += CHARSET[bytes[i] % CHARSET.length];
    }
    return result;
  };
  return `WFK-${segment(4)}-${segment(4)}-${segment(4)}`;
}

const testKey = generateLicenseKey();
console.log('Generated License Key:', testKey);
assert(/^WFK-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(testKey), 'License key format must match WFK-XXXX-XXXX-XXXX');
console.log('✓ License Key format passed');

// 2. Razorpay Webhook Signature Verification Test
function verifyWebhookSignature(rawBody, signature, secret) {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return expected.toLowerCase() === signature.toLowerCase();
}

const secret = 'rzp_test_secret_123456';
const samplePayload = JSON.stringify({
  entity: 'event',
  event: 'payment.captured',
  event_id: 'evt_test_123',
  payload: {
    payment: {
      entity: {
        id: 'pay_test_999',
        order_id: 'order_test_888',
        amount: 249900,
        status: 'captured',
      },
    },
  },
});

const validSignature = crypto.createHmac('sha256', secret).update(samplePayload).digest('hex');
const invalidSignature = 'bad_signature_0000000000000000000000000000000000000000000000000000';

assert.strictEqual(verifyWebhookSignature(samplePayload, validSignature, secret), true, 'Valid signature should pass');
assert.strictEqual(verifyWebhookSignature(samplePayload, invalidSignature, secret), false, 'Invalid signature should fail');
assert.strictEqual(verifyWebhookSignature(samplePayload, validSignature, 'wrong_secret'), false, 'Wrong secret should fail');
console.log('✓ Razorpay webhook signature verification passed');

// 3. Price and Coupon Math Tests
const subtotalPaise = 249900; // ₹2,499
const discountPercent = 10;
const discountPaise = Math.round((subtotalPaise * discountPercent) / 100);
assert.strictEqual(discountPaise, 24990, '10% of ₹2,499 should be 24,990 paise');
const totalPaise = subtotalPaise - discountPaise;
assert.strictEqual(totalPaise, 224910, 'Total should be 224,910 paise (₹2,249.10)');
console.log('✓ Paise money math & coupon calculation passed');

console.log('--- All Edge Function Unit Tests Passed Successfully! ---');
