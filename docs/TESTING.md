# wefik.world — Testing & Verification Guide

This document contains test credentials, procedures, and monitoring setups for `wefik.world`.

---

## 1. Razorpay Test Mode Credentials & Test Data

Ensure Razorpay keys in `.env.local` start with `rzp_test_`.

### A. Test Cards (Domestic INR)
| Card Type | Card Number | Expiry | CVV | OTP | Expected Result |
|-----------|-------------|--------|-----|-----|-----------------|
| Visa (Success) | `4012 0000 0000 0002` | `12/30` | `123` | Any (e.g. `123456`) | Payment Successful |
| Mastercard (Success) | `5123 4500 0000 0008` | `12/30` | `123` | Any (e.g. `123456`) | Payment Successful |
| RuPay (Success) | `5081 2600 0000 0005` | `12/30` | `123` | Any (e.g. `123456`) | Payment Successful |
| Failed Card | `4012 0000 0000 0001` | `12/30` | `123` | N/A | Payment Failure Simulated |

### B. Test UPI (UPI Intent / VPA)
- **Success VPA**: `success@razorpay` (Auto-authorizes immediately)
- **Pending/Failure VPA**: `failure@razorpay`

### C. Test Netbanking
- Select **HDFC Bank** or **ICICI Bank** in the test modal.
- Click **Success** on the Razorpay simulated banking screen.

---

## 2. Webhook Testing with Razorpay CLI

To forward Razorpay test webhooks to your local environment:
```bash
razorpay listen --forward-to localhost:54321/functions/v1/razorpay-webhook
```
Or when deploying Edge Functions:
Set Webhook URL in Razorpay Dashboard -> Settings -> Webhooks:
`https://<project-ref>.supabase.co/functions/v1/razorpay-webhook`
Secret: matches `RAZORPAY_WEBHOOK_SECRET` in `.env.local`.

Events to subscribe:
- `payment.captured`
- `payment.failed`
- `refund.processed`
- `subscription.charged`
- `subscription.cancelled`
- `subscription.completed`

---

## 3. UptimeRobot Setup (5-Minute Zero-Cost Uptime Monitoring)

1. Sign up for a free account at [uptimerobot.com](https://uptimerobot.com).
2. Click **+ Add New Monitor**:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `wefik.world - Health Check`
   - **URL (or IP)**: `https://wefik.world/api/health` (or `https://wefik.world`)
   - **Monitoring Interval**: `5 minutes`
   - **Monitor Timeout**: `30 seconds`
3. Alert Contacts:
   - Select your email address.
   - (Optional) Connect to Slack or Discord webhook for team notifications.
4. Save monitor. UptimeRobot will ping the health check every 5 minutes and alert immediately upon downtime.
