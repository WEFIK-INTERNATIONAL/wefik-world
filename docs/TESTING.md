# Testing Guide: Payments, Webhooks, and Monitoring

This guide provides test credentials and procedures for validating payments, memberships, and monitoring for **wefik.world**.

---

## 1. Razorpay Test Credentials (Test Mode)

### A. Test Credit & Debit Cards

| Card Type       | Card Number           | Expiry   | CVV | OTP      | Result    |
|-----------------|-----------------------|----------|-----|----------|-----------|
| Success Domestic| \`4111 1111 1111 1111\` | Any future | \`123\`| \`123456\` | Approved  |
| Declined Card   | \`4000 0000 0000 0002\` | Any future | \`123\`| Any      | Declined  |
| Expired Card    | \`4000 0000 0000 0005\` | Past date   | \`123\`| Any      | Expired   |

### B. Test UPI Payment
- In Razorpay Checkout modal, choose **UPI / QR**.
- Enter Virtual Payment Address (VPA): \`success@razorpay\`
- Authorize test payment on the mock prompt.

---

## 2. Webhook Testing & Simulation

The Razorpay webhook endpoint is located at:
\`https://<project-ref>.supabase.co/functions/v1/razorpay-webhook\`

### Test Payload Simulation (\`payment.captured\`)

\`\`\`bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/razorpay-webhook \\
  -H "Content-Type: application/json" \\
  -H "X-Razorpay-Signature: <computed-hmac-sha256>" \\
  -d '{
    "entity": "event",
    "account_id": "acc_test",
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_test_001",
          "amount": 249900,
          "currency": "INR",
          "status": "captured",
          "order_id": "order_test_001"
        }
      }
    }
  }'
\`\`\`

> [!TIP]
> The automated suite in \`tests/checkout-e2e.test.mjs\` verifies HMAC-SHA256 signature calculation and idempotency keys automatically.

---

## 3. UptimeRobot Monitoring Setup (5-Minute Guide)

1. Sign up for a free account at [uptimerobot.com](https://uptimerobot.com).
2. Click **Add New Monitor**.
3. Configure the monitor:
   - **Monitor Type**: \`HTTP(s)\`
   - **Friendly Name**: \`wefik.world - Health Check\`
   - **URL / IP**: \`https://wefik.world/api/health\`
   - **Monitoring Interval**: \`5 minutes\`
   - **Alert Contacts**: Select your team email / Slack webhook.
4. Click **Create Monitor**.
   The \`/api/health\` endpoint returns status \`200 OK\` and JSON \`{ "status": "ok", "uptime": ... }\`.

---

## 4. Acceptance Verification Checklist (Section 8)

Run the automated test suite locally at any time:

\`\`\`bash
# 1. Edge functions unit tests
node tests/edge-functions.test.mjs

# 2. Auth & middleware routing test
node tests/auth-middleware.test.mjs

# 3. Checkout, paise math & webhook idempotency test
node tests/checkout-e2e.test.mjs

# 4. Authorization & download access matrix test
node tests/authz-matrix.test.mjs

# 5. Full Next.js production build test
npm run build
\`\`\`
