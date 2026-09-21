import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

export class RazorpayClient {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
    this.keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";
  }

  get isConfigured(): boolean {
    return Boolean(this.keyId && this.keySecret);
  }

  private get authHeader(): string {
    return `Basic ${encodeBase64(`${this.keyId}:${this.keySecret}`)}`;
  }

  /**
   * Create Razorpay Order
   * amount must be in paise (integer)
   */
  async createOrder(params: {
    amount: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
  }) {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency ?? "INR",
        receipt: params.receipt,
        notes: params.notes,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Razorpay createOrder failed (${res.status}): ${errText}`);
    }

    return await res.json();
  }

  /**
   * Create Razorpay Subscription (Monthly Plan)
   */
  async createSubscription(params: {
    plan_id: string;
    total_count?: number;
    customer_notify?: 0 | 1;
    notes?: Record<string, string>;
  }) {
    const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: params.plan_id,
        total_count: params.total_count ?? 120, // up to 10 years
        customer_notify: params.customer_notify ?? 1,
        notes: params.notes,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Razorpay createSubscription failed (${res.status}): ${errText}`);
    }

    return await res.json();
  }
}

export const razorpay = new RazorpayClient();

/**
 * Verify HMAC-SHA256 Razorpay webhook signature
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const expectedSignature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return expectedSignature.toLowerCase() === signature.toLowerCase();
}
