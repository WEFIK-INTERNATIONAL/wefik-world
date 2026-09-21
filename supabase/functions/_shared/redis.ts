/**
 * Upstash Redis REST Client for Deno Edge Functions
 */
export class UpstashRedis {
  private url: string;
  private token: string;

  constructor() {
    this.url = Deno.env.get("UPSTASH_REDIS_REST_URL") ?? "";
    this.token = Deno.env.get("UPSTASH_REDIS_REST_TOKEN") ?? "";
  }

  get isConfigured(): boolean {
    return Boolean(this.url && this.token);
  }

  private async execute(command: unknown[]): Promise<any> {
    if (!this.isConfigured) return null;
    try {
      const res = await fetch(this.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.result;
    } catch (err) {
      console.error("Upstash Redis error:", err);
      return null;
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.execute(["GET", key]);
  }

  async set(key: string, value: string, exSeconds?: number): Promise<boolean> {
    if (exSeconds) {
      const res = await this.execute(["SET", key, value, "EX", exSeconds]);
      return res === "OK";
    }
    const res = await this.execute(["SET", key, value]);
    return res === "OK";
  }

  async incr(key: string): Promise<number> {
    const res = await this.execute(["INCR", key]);
    return typeof res === "number" ? res : 0;
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const res = await this.execute(["EXPIRE", key, seconds]);
    return res === 1;
  }

  /**
   * Check rate limit: returns { allowed: boolean, count: number }
   */
  async checkRateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; count: number }> {
    if (!this.isConfigured) {
      return { allowed: true, count: 0 };
    }
    const key = `ratelimit:${identifier}`;
    const count = await this.incr(key);
    if (count === 1) {
      await this.expire(key, windowSeconds);
    }
    return {
      allowed: count <= limit,
      count,
    };
  }

  /**
   * Atomically check and set an idempotency key (e.g. Razorpay event ID)
   * Returns true if newly acquired, false if already processed.
   */
  async acquireIdempotency(key: string, ttlSeconds: number = 86400): Promise<boolean> {
    if (!this.isConfigured) return true;
    const res = await this.execute(["SET", `idempotency:${key}`, "1", "NX", "EX", ttlSeconds]);
    return res === "OK";
  }
}

export const redis = new UpstashRedis();
