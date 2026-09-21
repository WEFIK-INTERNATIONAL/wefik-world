import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";
import { razorpay } from "../_shared/razorpay.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProductItemInput {
  product_id: string;
  license_type: "single" | "unlimited";
}

type CreateOrderInput =
  | {
      kind: "products";
      items: ProductItemInput[];
      coupon_code?: string;
    }
  | {
      kind: "membership";
      plan: "lifetime";
      coupon_code?: string;
    };

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Authentication required to checkout" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = (await req.json()) as CreateOrderInput;
    const supabase = createAdminClient();

    let subtotalPaise = 0;
    const orderItemsToInsert: Array<{
      product_id: string | null;
      item_type: "product" | "membership_monthly" | "membership_lifetime";
      price: number;
      license_type: "single" | "unlimited";
    }> = [];

    if (payload.kind === "membership") {
      if (payload.plan !== "lifetime") {
        return new Response(
          JSON.stringify({ error: "Monthly memberships must use create-subscription" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if user already has an active lifetime membership
      const { data: existingMembership } = await supabase
        .from("memberships")
        .select("id, plan, status")
        .eq("user_id", user.id)
        .eq("plan", "lifetime")
        .eq("status", "active")
        .maybeSingle();

      if (existingMembership) {
        return new Response(
          JSON.stringify({ error: "You already have an active Lifetime Deal membership." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get lifetime plan price from DB
      const { data: planData, error: planErr } = await supabase
        .from("membership_plans")
        .select("price_inr")
        .eq("plan", "lifetime")
        .single();

      if (planErr || !planData) {
        throw new Error("Lifetime membership plan not found in database");
      }

      subtotalPaise = planData.price_inr;
      orderItemsToInsert.push({
        product_id: null,
        item_type: "membership_lifetime",
        price: subtotalPaise,
        license_type: "unlimited",
      });
    } else if (payload.kind === "products") {
      if (!payload.items || payload.items.length === 0) {
        return new Response(
          JSON.stringify({ error: "No items provided in order" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check duplicate purchase for each item: user must not have active license
      for (const item of payload.items) {
        const { data: existingLicense } = await supabase
          .from("licenses")
          .select("id, products(title)")
          .eq("user_id", user.id)
          .eq("product_id", item.product_id)
          .eq("status", "active")
          .maybeSingle();

        if (existingLicense) {
          const title = (existingLicense as any).products?.title || "this product";
          return new Response(
            JSON.stringify({ error: `You already own ${title}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Fetch products from database
      const productIds = payload.items.map((i) => i.product_id);
      const { data: products, error: prodErr } = await supabase
        .from("products")
        .select("id, title, price_inr, is_free, status")
        .in("id", productIds);

      if (prodErr || !products || products.length !== payload.items.length) {
        return new Response(
          JSON.stringify({ error: "One or more products not found" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      for (const item of payload.items) {
        const prod = products.find((p) => p.id === item.product_id);
        if (!prod || prod.status !== "published") {
          return new Response(
            JSON.stringify({ error: `Product unavailable: ${prod?.title || item.product_id}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Unlimited license is 2x price or standard 1x
        let itemPrice = prod.price_inr;
        if (item.license_type === "unlimited") {
          itemPrice = Math.round(prod.price_inr * 2);
        }

        subtotalPaise += itemPrice;
        orderItemsToInsert.push({
          product_id: prod.id,
          item_type: "product",
          price: itemPrice,
          license_type: item.license_type,
        });
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid order kind" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle Coupon Discount
    let discountPaise = 0;
    let validatedCouponCode: string | null = null;

    if (payload.coupon_code) {
      const trimmedCode = payload.coupon_code.trim().toUpperCase();
      const { data: coupon, error: couponErr } = await supabase
        .from("coupons")
        .select("id, code, discount_percent, discount_fixed_inr, valid_from, valid_until, max_uses, used_count, is_active")
        .eq("code", trimmedCode)
        .eq("is_active", true)
        .maybeSingle();

      if (!couponErr && coupon) {
        const now = new Date();
        const validFrom = new Date(coupon.valid_from);
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

        const isTimeValid = now >= validFrom && (!validUntil || now <= validUntil);
        const isUsesValid = coupon.max_uses === null || coupon.used_count < coupon.max_uses;

        if (isTimeValid && isUsesValid) {
          validatedCouponCode = coupon.code;
          if (coupon.discount_percent > 0) {
            discountPaise = Math.round((subtotalPaise * coupon.discount_percent) / 100);
          } else if (coupon.discount_fixed_inr && coupon.discount_fixed_inr > 0) {
            discountPaise = Math.min(subtotalPaise, coupon.discount_fixed_inr);
          }
        }
      }
    }

    const totalAmountPaise = Math.max(0, subtotalPaise - discountPaise);

    if (totalAmountPaise === 0) {
      return new Response(
        JSON.stringify({ error: "Total amount is ₹0. Use free claim endpoint instead." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert pending order in database
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal: subtotalPaise,
        discount_amount: discountPaise,
        total_amount: totalAmountPaise,
        currency: "INR",
        coupon_code: validatedCouponCode,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      throw new Error(`Failed to create order: ${orderErr?.message}`);
    }

    // Insert order items
    const itemsData = orderItemsToInsert.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(itemsData);
    if (itemsErr) {
      throw new Error(`Failed to insert order items: ${itemsErr.message}`);
    }

    // Create Razorpay Order
    let razorpayOrder;
    if (razorpay.isConfigured) {
      razorpayOrder = await razorpay.createOrder({
        amount: totalAmountPaise,
        currency: "INR",
        receipt: `order_${order.id.slice(0, 10)}`,
        notes: {
          order_id: order.id,
          user_id: user.id,
          user_email: user.email ?? "",
        },
      });

      // Update order with razorpay_order_id
      await supabase
        .from("orders")
        .update({ razorpay_order_id: razorpayOrder.id })
        .eq("id", order.id);
    } else {
      // Mock order ID if keys are pending
      const mockRzpId = `order_mock_${Date.now()}`;
      await supabase
        .from("orders")
        .update({ razorpay_order_id: mockRzpId })
        .eq("id", order.id);
      razorpayOrder = { id: mockRzpId };
    }

    return new Response(
      JSON.stringify({
        order_id: order.id,
        razorpay_order_id: razorpayOrder.id,
        amount: totalAmountPaise,
        currency: "INR",
        subtotal: subtotalPaise,
        discount: discountPaise,
        key_id: Deno.env.get("RAZORPAY_KEY_ID") || "",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("create-order error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
