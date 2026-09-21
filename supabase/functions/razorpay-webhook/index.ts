import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase.ts";
import { verifyWebhookSignature } from "../_shared/razorpay.ts";
import { generateLicenseKey } from "../_shared/keygen.ts";
import { redis } from "../_shared/redis.ts";
import { sendEmail, purchaseReceiptTemplate } from "../_shared/email-templates.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";

  // Verify webhook signature (Fix 8 & Global Acceptance)
  const isValid = await verifyWebhookSignature(rawBody, signature, secret);
  if (!isValid && secret) {
    console.error("Razorpay webhook signature mismatch");
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON payload", { status: 400 });
  }

  const eventId = event.event_id || event.id || `${event.event}_${Date.now()}`;
  const supabase = createAdminClient();

  // Redis idempotency key check (Fix 8)
  const isNewEvent = await redis.acquireIdempotency(eventId, 86400); // 24hr TTL
  if (!isNewEvent) {
    console.log(`Duplicate webhook event ${eventId} ignored`);
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const eventType = event.event;

    // ------------------------------------------------------------------------
    // 1. PAYMENT CAPTURED — Fulfill order & issue licenses / memberships
    // ------------------------------------------------------------------------
    if (eventType === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const razorpayPaymentId = payment?.id;

      if (!razorpayOrderId) {
        return new Response("No order_id in payment payload", { status: 200 });
      }

      // Fetch order by razorpay_order_id
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("*, profiles(email, full_name)")
        .eq("razorpay_order_id", razorpayOrderId)
        .single();

      if (orderErr || !order) {
        console.warn(`Order not found for razorpay_order_id: ${razorpayOrderId}`);
        return new Response("Order not found", { status: 200 });
      }

      // Idempotency: if order is already paid, return 200 immediately
      if (order.status === "paid") {
        console.log(`Order ${order.id} already paid. Returning 200.`);
        return new Response(JSON.stringify({ received: true, already_paid: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Mark order as paid
      await supabase
        .from("orders")
        .update({
          status: "paid",
          razorpay_payment_id: razorpayPaymentId,
        })
        .eq("id", order.id);

      // Increment coupon usage atomically if coupon was applied
      if (order.coupon_code) {
        const { data: coupon } = await supabase
          .from("coupons")
          .select("id")
          .eq("code", order.coupon_code)
          .maybeSingle();

        if (coupon) {
          await supabase.rpc("increment_coupon_use", { coupon_id: coupon.id });
        }
      }

      // Fetch order items
      const { data: items, error: itemsErr } = await supabase
        .from("order_items")
        .select("*, products(*)")
        .eq("order_id", order.id);

      if (itemsErr || !items) {
        console.error("Failed to load order items for fulfillment");
        return new Response("Items error", { status: 200 });
      }

      const receiptItems: Array<{
        title: string;
        pricePaise: number;
        licenseKey?: string;
        licenseType?: string;
      }> = [];

      for (const item of items) {
        // Handle Lifetime Deal Membership
        if (item.item_type === "membership_lifetime") {
          await supabase.from("memberships").insert({
            user_id: order.user_id,
            plan: "lifetime",
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: null, // Lifetime deals never expire
          });

          receiptItems.push({
            title: "Lifetime Deal — All-Access Pass",
            pricePaise: item.price,
            licenseType: "unlimited",
          });
          continue;
        }

        // Handle Single Product or Bundle
        const product = item.products;
        if (!product) continue;

        // If product is a bundle, expand bundle_product_ids!
        const productsToLicense: Array<{ id: string; title: string }> = [];
        if (product.is_bundle && product.bundle_product_ids?.length) {
          const { data: bundleProds } = await supabase
            .from("products")
            .select("id, title")
            .in("id", product.bundle_product_ids);

          if (bundleProds) {
            productsToLicense.push(...bundleProds);
          }
        } else {
          productsToLicense.push({ id: product.id, title: product.title });
        }

        for (const targetProd of productsToLicense) {
          const licenseKey = generateLicenseKey();
          const maxActivations = item.license_type === "unlimited" ? 9999 : 1;

          await supabase.from("licenses").insert({
            license_key: licenseKey,
            user_id: order.user_id,
            product_id: targetProd.id,
            order_id: order.id,
            license_type: item.license_type,
            status: "active",
            max_activations: maxActivations,
          });

          // Increment product download counter
          await supabase.rpc("increment_product_downloads", { p_id: targetProd.id });

          receiptItems.push({
            title: targetProd.title,
            pricePaise: item.price,
            licenseKey,
            licenseType: item.license_type,
          });
        }
      }

      // Send purchase receipt email (Fix 4)
      const customerEmail = (order as any).profiles?.email;
      const customerName = (order as any).profiles?.full_name || "";
      if (customerEmail) {
        const receiptHtml = purchaseReceiptTemplate({
          customerName,
          orderId: order.id,
          totalAmountPaise: order.total_amount,
          items: receiptItems,
        });

        await sendEmail({
          to: customerEmail,
          subject: `Your wefik.world Purchase Receipt (#${order.id.slice(0, 8)})`,
          html: receiptHtml,
        });
      }

      console.log(`Order ${order.id} successfully fulfilled.`);
    }

    // ------------------------------------------------------------------------
    // 2. PAYMENT FAILED
    // ------------------------------------------------------------------------
    else if (eventType === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      if (razorpayOrderId) {
        await supabase
          .from("orders")
          .update({ status: "failed" })
          .eq("razorpay_order_id", razorpayOrderId);
      }
    }

    // ------------------------------------------------------------------------
    // 3. REFUND PROCESSED / CREATED
    // ------------------------------------------------------------------------
    else if (eventType === "refund.processed" || eventType === "refund.created") {
      const refund = event.payload?.refund?.entity;
      const paymentId = refund?.payment_id;

      if (paymentId) {
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("razorpay_payment_id", paymentId)
          .maybeSingle();

        if (order) {
          // Mark order refunded
          await supabase.from("orders").update({ status: "refunded" }).eq("id", order.id);

          // Revoke all licenses associated with this order
          await supabase
            .from("licenses")
            .update({ status: "revoked" })
            .eq("order_id", order.id);

          console.log(`Order ${order.id} refunded and licenses revoked.`);
        }
      }
    }

    // ------------------------------------------------------------------------
    // 4. SUBSCRIPTION CHARGED (Monthly Recurring Billing - Fix 2)
    // ------------------------------------------------------------------------
    else if (eventType === "subscription.charged") {
      const subscription = event.payload?.subscription?.entity;
      const subscriptionId = subscription?.id;

      if (subscriptionId) {
        const { data: membership } = await supabase
          .from("memberships")
          .select("id, user_id")
          .eq("razorpay_subscription_id", subscriptionId)
          .maybeSingle();

        if (membership) {
          const now = new Date();
          const nextMonth = new Date(now);
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          await supabase
            .from("memberships")
            .update({
              status: "active",
              current_period_start: now.toISOString(),
              current_period_end: nextMonth.toISOString(),
            })
            .eq("id", membership.id);

          console.log(`Monthly membership ${membership.id} extended to ${nextMonth.toISOString()}`);
        }
      }
    }

    // ------------------------------------------------------------------------
    // 5. SUBSCRIPTION CANCELLED OR COMPLETED
    // ------------------------------------------------------------------------
    else if (
      eventType === "subscription.cancelled" ||
      eventType === "subscription.completed"
    ) {
      const subscription = event.payload?.subscription?.entity;
      const subscriptionId = subscription?.id;

      if (subscriptionId) {
        await supabase
          .from("memberships")
          .update({ status: "cancelled" })
          .eq("razorpay_subscription_id", subscriptionId);

        console.log(`Subscription ${subscriptionId} marked cancelled.`);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
